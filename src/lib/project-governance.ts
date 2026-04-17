import { Prisma } from "@/src/generated/client/client"
import {
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client/enums"
import { auth } from "@clerk/nextjs/server"

import prisma from "@/src/lib/prisma"

export async function getCurrentAppUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { clerkId: userId },
  })
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
    project.clientId === user.id

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
}
