"use server"

import { revalidatePath } from "next/cache"

import {
  AssetType,
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client/enums"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotification,
  ensureProjectAccess,
  getAuditOriginLabel,
  getCurrentAppUser,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import {
  addProjectTimelineSchema,
  rejectProjectUpdateSchema,
} from "@/src/lib/validations/project"

import { getAdminProjectPath, getDashboardPath } from "./project-action-utils"

type TimelineAttachmentInput = {
  name: string
  url: string
  key: string
  customId?: string | null
  type: AssetType
  mimeType?: string | null
  size?: number | null
}

function parseTimelineAttachments(
  rawValue: FormDataEntryValue | null
): TimelineAttachmentInput[] {
  if (typeof rawValue !== "string" || rawValue.length === 0) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as TimelineAttachmentInput[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    logger.error({ error }, "Invalid timeline attachments payload")
    return []
  }
}

export async function addProjectTimelineAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const isMilestoneRaw = formData.get("isMilestone")
  const requiresApprovalRaw = formData.get("requiresApproval")

  const validatedFields = addProjectTimelineSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    isMilestone: isMilestoneRaw === "true" || isMilestoneRaw === "on",
    requiresApproval:
      requiresApprovalRaw === "true" || requiresApprovalRaw === "on",
    imageUrl: formData.get("imageUrl") || undefined,
    attachments: parseTimelineAttachments(formData.get("attachments")),
    timezone: formData.get("timezone"),
  })

  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0]?.message ?? "Dados inválidos"
    logger.error(
      { errors: validatedFields.error.flatten() },
      "Validation Error in addProjectTimelineAction"
    )
    return { error }
  }

  const actor = await getCurrentAppUser()
  const {
    projectId,
    title,
    description,
    isMilestone,
    requiresApproval,
    imageUrl,
    attachments,
    timezone,
  } = validatedFields.data

  try {
    const coverImage =
      imageUrl ||
      attachments.find((attachment) => attachment.type === AssetType.IMAGE)?.url

    const update = await prisma.update.create({
      data: {
        projectId,
        title,
        description: description ?? null,
        isMilestone,
        requiresApproval,
        approvalStatus: "PENDING",
        approvedAt: null,
        imageUrl: coverImage || null,
        timezone,
        attachments: attachments.length
          ? {
              create: attachments.map((attachment) => ({
                name: attachment.name,
                url: attachment.url,
                key: attachment.key,
                customId: attachment.customId ?? null,
                type: attachment.type,
                mimeType: attachment.mimeType ?? null,
                size: attachment.size ?? null,
              })),
            }
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientId: true,
          },
        },
        attachments: true,
      },
    })

    try {
      await createAuditLog({
        action: "update.created",
        entityType: "Update",
        entityId: update.id,
        summary: `Atualização "${update.title}" registrada no projeto ${update.project.name}.`,
        actorId: actor?.id,
        actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
        projectId,
        metadata: {
          origin: getAuditOriginLabel({
            actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
            role: actor?.role,
          }),
          requiresApproval,
          isMilestone,
          attachmentsCount: update.attachments.length,
          after: {
            requiresApproval,
            isMilestone,
            attachmentsCount: update.attachments.length,
          },
          relatedEntities: [
            {
              type: "Project",
              id: update.project.id,
              label: update.project.name,
            },
            {
              type: "Update",
              id: update.id,
              label: update.title,
            },
          ],
        },
      })

      if (requiresApproval) {
        await createNotification({
          userId: update.project.clientId,
          projectId,
          type: NotificationType.UPDATE_PENDING_APPROVAL,
          title: "Nova aprovação pendente",
          message: `A atualização "${update.title}" está pronta para sua validação.`,
          ctaPath: getDashboardPath(projectId),
          metadata: {
            updateId: update.id,
            attachmentsCount: update.attachments.length,
          },
        })
      } else {
        await createNotification({
          userId: update.project.clientId,
          projectId,
          type: NotificationType.UPDATE_PUBLISHED,
          title: "Nova evolução publicada",
          message: `A atualização "${update.title}" foi adicionada na timeline do projeto.`,
          ctaPath: getDashboardPath(projectId),
          metadata: {
            updateId: update.id,
            attachmentsCount: update.attachments.length,
          },
        })
      }
    } catch (govError) {
      logger.error(
        { govError },
        "Add Timeline Governance Error (Non-blocking):"
      )
    }

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath("/")
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Timeline Error:")
    return { error: "Erro ao adicionar atualização no banco de dados" }
  }
}

export async function approveUpdateAction(
  updateId: string,
  projectId: string,
  comment?: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user, project } = await ensureProjectAccess(projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    const update = await prisma.update.update({
      where: { id: updateId, projectId },
      data: {
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        feedback: null,
        approvalEvents: {
          create: {
            decision: "APPROVED",
            comment: comment || null,
            actorId: user.id,
          },
        },
      },
    })

    await createAuditLog({
      action: "update.approved",
      entityType: "Update",
      entityId: update.id,
      summary: `Atualização "${update.title}" aprovada pelo cliente.`,
      actorId: user.id,
      actorType: AuditActorType.USER,
      projectId,
      metadata: {
        origin: getAuditOriginLabel({
          actorType: AuditActorType.USER,
          role: user.role,
        }),
        before: {
          approvalStatus: "PENDING",
        },
        after: {
          approvalStatus: "APPROVED",
        },
        comment,
        relatedEntities: [
          {
            type: "Project",
            id: project.id,
            label: project.name,
          },
          {
            type: "Update",
            id: update.id,
            label: update.title,
          },
        ],
      },
    })

    const admins = await getInternalNotificationRecipients()

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          projectId,
          type: NotificationType.UPDATE_APPROVED,
          title: "Milestone aprovada",
          message: `${project.client.name ?? "O cliente"} aprovou "${update.title}".`,
          ctaPath: getAdminProjectPath(projectId),
          metadata: { updateId: update.id, comment },
        })
      )
    )

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/projects")
    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Approve Update Error:")
    return { error: "Erro ao aprovar atualização" }
  }
}

export async function rejectUpdateAction(input: {
  updateId: string
  projectId: string
  feedback: string
}): Promise<{ error?: string; success?: boolean }> {
  const validated = rejectProjectUpdateSchema.safeParse(input)

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { user, project } = await ensureProjectAccess(
      validated.data.projectId,
      [UserRole.CLIENT, UserRole.ADMIN, UserRole.MEMBER]
    )

    const update = await prisma.update.update({
      where: {
        id: validated.data.updateId,
        projectId: validated.data.projectId,
      },
      data: {
        approvalStatus: "REJECTED",
        approvedAt: null,
        feedback: validated.data.feedback,
        approvalEvents: {
          create: {
            decision: "REJECTED",
            comment: validated.data.feedback,
            actorId: user.id,
          },
        },
      },
    })

    await createAuditLog({
      action: "update.rejected",
      entityType: "Update",
      entityId: update.id,
      summary: `Atualização "${update.title}" reprovada com feedback do cliente.`,
      actorId: user.id,
      actorType: AuditActorType.USER,
      projectId: validated.data.projectId,
      metadata: {
        origin: getAuditOriginLabel({
          actorType: AuditActorType.USER,
          role: user.role,
        }),
        before: {
          approvalStatus: "PENDING",
        },
        after: {
          approvalStatus: "REJECTED",
        },
        feedback: validated.data.feedback,
        relatedEntities: [
          {
            type: "Project",
            id: project.id,
            label: project.name,
          },
          {
            type: "Update",
            id: update.id,
            label: update.title,
          },
        ],
      },
    })

    const admins = await getInternalNotificationRecipients()

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          projectId: validated.data.projectId,
          type: NotificationType.UPDATE_REJECTED,
          title: "Milestone precisa de ajustes",
          message: `${project.client.name ?? "O cliente"} enviou feedback em "${update.title}".`,
          ctaPath: getAdminProjectPath(validated.data.projectId),
          metadata: {
            updateId: update.id,
            feedback: validated.data.feedback,
          },
        })
      )
    )

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/projects")
    revalidatePath(`/admin/projects/${validated.data.projectId}`)
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Reject Update Error:")
    return { error: "Erro ao registrar feedback da atualização" }
  }
}
