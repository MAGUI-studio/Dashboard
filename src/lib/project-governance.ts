import { revalidatePath } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import {
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client/enums"
import { auth, clerkClient } from "@clerk/nextjs/server"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"

const clerkRoleMap = {
  admin: UserRole.ADMIN,
  member: UserRole.MEMBER,
  client: UserRole.CLIENT,
} as const

function normalizeClerkRole(rawRole: unknown): UserRole {
  if (typeof rawRole !== "string") {
    return UserRole.CLIENT
  }

  return (
    clerkRoleMap[rawRole.toLowerCase() as keyof typeof clerkRoleMap] ??
    UserRole.CLIENT
  )
}

async function upsertUserFromClerk(clerkUserId: string) {
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(clerkUserId)
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!primaryEmail) {
    throw new Error("Clerk user is missing a primary email")
  }

  const userData = {
    email: primaryEmail,
    name:
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.fullName ||
      clerkUser.username ||
      primaryEmail,
    role: normalizeClerkRole(clerkUser.publicMetadata?.role),
    avatarUrl: clerkUser.imageUrl ?? null,
  }

  // Simple retry logic for transient connection errors
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      return await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: userData,
        create: {
          clerkId: clerkUser.id,
          ...userData,
        },
      })
    } catch (error) {
      attempts++
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("closed the connection") ||
          error.message.includes("socket hang up"))

      if (isConnectionError && attempts < maxAttempts) {
        logger.warn(
          { attempts, clerkUserId },
          "Database connection closed during upsert, retrying..."
        )
        await new Promise((resolve) => setTimeout(resolve, 500 * attempts))
        continue
      }
      throw error
    }
  }

  throw new Error("Unable to sync Clerk user after retries")
}

export async function getCurrentAppUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  return upsertUserFromClerk(userId)
}

export async function getInternalNotificationRecipients(): Promise<
  Array<{ id: string }>
> {
  const client = await clerkClient()
  const clerkUsers = await client.users.getUserList({ limit: 100 })

  const internalUsers = clerkUsers.data.filter((user) => {
    const role = normalizeClerkRole(user.publicMetadata?.role)
    return role === UserRole.ADMIN || role === UserRole.MEMBER
  })

  if (internalUsers.length === 0) {
    return []
  }

  const syncedUsers = await Promise.all(
    internalUsers.map((user) => upsertUserFromClerk(user.id))
  )

  return syncedUsers.map((user) => ({ id: user.id }))
}

export async function ensureProjectAccess(
  projectId: string,
  allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MEMBER, UserRole.CLIENT]
) {
  const user = await getCurrentAppUser()

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      clientId: true,
      members: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          role: true,
          userId: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const canAccess =
    user.role === UserRole.ADMIN ||
    user.role === UserRole.MEMBER ||
    project.clientId === user.id ||
    project.members.length > 0

  if (!canAccess) {
    throw new Error("Unauthorized")
  }

  return { user, project }
}

export async function createAuditLog(data: {
  action: string
  entityType: string
  entityId: string
  summary: string
  metadata?: Prisma.InputJsonValue
  actorId?: string | null
  actorType?: AuditActorType
  projectId?: string | null
}) {
  await prisma.auditLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      summary: data.summary,
      metadata: data.metadata,
      actorId: data.actorId ?? null,
      actorType: data.actorType ?? AuditActorType.SYSTEM,
      projectId: data.projectId ?? null,
    },
  })
}

export function getAuditOriginLabel(input: {
  actorType?: AuditActorType
  role?: UserRole | null
}): string {
  if (input.actorType === AuditActorType.SYSTEM) {
    return "system"
  }

  if (input.role === UserRole.ADMIN) {
    return "admin_panel"
  }

  if (input.role === UserRole.MEMBER) {
    return "operations_panel"
  }

  return "client_portal"
}

export async function createNotification(data: {
  userId: string
  type: NotificationType
  title: string
  message: string
  ctaPath?: string | null
  metadata?: Prisma.InputJsonValue
  projectId?: string | null
}) {
  await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      ctaPath: data.ctaPath ?? null,
      metadata: data.metadata,
      projectId: data.projectId ?? null,
    },
  })

  revalidatePath("/", "layout")
  revalidatePath("/admin")
  revalidatePath("/admin/projects")
  if (data.projectId) {
    revalidatePath(`/admin/projects/${data.projectId}`)
  }
  revalidatePath("/notifications")
}
