"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import {
  AssetType,
  Priority,
  ProjectCategory,
  ProjectStatus,
} from "@/src/generated/client/enums"
import {
  AssetOrigin,
  AssetVisibility,
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
  getCurrentAppUser,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import {
  addProjectTimelineSchema,
  briefingSchema,
  createProjectSchema,
  rejectProjectUpdateSchema,
  updateProjectStatusSchema,
} from "@/src/lib/validations/project"

function getDashboardPath(projectId: string): string {
  return `/?project=${projectId}`
}

function getAdminProjectPath(projectId: string): string {
  return `/admin/projects/${projectId}`
}

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

export async function createProjectAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const t = await getTranslations("Admin.projects.form.errors")

  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const validatedFields = createProjectSchema.safeParse({
    clientId: formData.get("clientId"),
    projectName: formData.get("projectName"),
    projectDescription: formData.get("projectDescription"),
    budget: formData.get("budget"),
    deadline: formData.get("deadline"),
    startDate: formData.get("startDate"),
    liveUrl: formData.get("liveUrl"),
    repositoryUrl: formData.get("repositoryUrl"),
    category: formData.get("category"),
    priority: formData.get("priority"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message || t("validation_failed"),
    }
  }

  const data = validatedFields.data
  const actor = await getCurrentAppUser()

  try {
    const project = await prisma.project.create({
      data: {
        name: data.projectName,
        description: data.projectDescription ?? null,
        budget: data.budget ?? null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        liveUrl: data.liveUrl || null,
        repositoryUrl: data.repositoryUrl || null,
        category: data.category as ProjectCategory,
        priority: data.priority as Priority,
        clientId: data.clientId,
        status: ProjectStatus.STRATEGY,
        progress: 0,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const initialUpdate = await prisma.update.create({
      data: {
        title: "Projeto iniciado",
        description: "Fase de estratégia iniciada com sucesso.",
        projectId: project.id,
        isMilestone: true,
        timezone: (formData.get("timezone") as string) || "America/Sao_Paulo",
      },
    })

    await createAuditLog({
      action: "project.created",
      entityType: "Project",
      entityId: project.id,
      summary: `Projeto ${project.name} criado para ${project.client.name ?? "cliente"}.`,
      actorId: actor?.id,
      actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
      projectId: project.id,
      metadata: {
        category: project.category,
        priority: project.priority,
        initialUpdateId: initialUpdate.id,
      },
    })

    await createNotification({
      userId: data.clientId,
      projectId: project.id,
      type: NotificationType.PROJECT_STATUS_CHANGED,
      title: "Novo projeto liberado no painel",
      message: `O projeto ${project.name} já está disponível para acompanhamento.`,
      ctaPath: getDashboardPath(project.id),
    })

    revalidatePath("/admin/projects")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Project Error:")
    const message =
      error instanceof Error ? error.message : "Erro ao criar o projeto"
    return { error: message }
  }
}

export async function updateProjectStatusAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const validatedFields = updateProjectStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    progress: Number(formData.get("progress")),
  })

  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0]?.message ?? "Dados inválidos"
    return { error }
  }

  const { id, status, progress } = validatedFields.data
  const actor = await getCurrentAppUser()

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        status: status as ProjectStatus,
        progress,
      },
      include: {
        client: {
          select: {
            id: true,
          },
        },
      },
    })

    await Promise.all([
      createAuditLog({
        action: "project.status_updated",
        entityType: "Project",
        entityId: project.id,
        summary: `Status do projeto ${project.name} atualizado para ${status}.`,
        actorId: actor?.id,
        actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
        projectId: project.id,
        metadata: { status, progress },
      }),
      createNotification({
        userId: project.client.id,
        projectId: project.id,
        type: NotificationType.PROJECT_STATUS_CHANGED,
        title: "Status do projeto atualizado",
        message: `${project.name} avançou para ${status} com ${progress}% de progresso.`,
        ctaPath: getDashboardPath(project.id),
      }),
    ])

    revalidatePath(`/admin/projects/${id}`)
    revalidatePath("/admin/projects")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Project Error:")
    return { error: "Erro ao atualizar o projeto" }
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

    // Governance tasks should not block the response if they fail
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
          requiresApproval,
          isMilestone,
          attachmentsCount: update.attachments.length,
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
      metadata: { comment },
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
      metadata: { feedback: validated.data.feedback },
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

export async function updateProjectBriefingAction(
  projectId: string,
  briefing: Prisma.InputJsonValue
): Promise<{ error?: string; success?: boolean }> {
  const validatedBriefing = briefingSchema.safeParse(briefing)

  if (!validatedBriefing.success) {
    return {
      error: validatedBriefing.error.issues[0]?.message ?? "Briefing inválido",
    }
  }

  try {
    const { user, project } = await ensureProjectAccess(projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.project.update({
      where: { id: projectId },
      data: { briefing: validatedBriefing.data },
    })

    await Promise.all([
      createAuditLog({
        action: "project.briefing_updated",
        entityType: "Project",
        entityId: projectId,
        summary: `Briefing do projeto ${project.name} atualizado.`,
        actorId: user.id,
        actorType: AuditActorType.USER,
        projectId,
      }),
      ...(user.role === UserRole.CLIENT
        ? (
            await prisma.user.findMany({
              where: {
                role: { in: [UserRole.ADMIN, UserRole.MEMBER] },
              },
              select: { id: true },
            })
          ).map((admin) =>
            createNotification({
              userId: admin.id,
              projectId,
              type: NotificationType.BRIEFING_SUBMITTED,
              title: "Briefing enviado",
              message: `${project.client.name ?? "O cliente"} atualizou o briefing de ${project.name}.`,
              ctaPath: `/admin/projects/${projectId}`,
            })
          )
        : []),
    ])

    revalidatePath("/")
    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Briefing Error:")
    return { error: "Erro ao atualizar briefing" }
  }
}

export async function savePartialBriefingAction(
  projectId: string,
  partialBriefing: Record<string, unknown>
): Promise<{ error?: string; success?: boolean }> {
  // We allow partial updates during steps
  const validated = briefingSchema.partial().safeParse(partialBriefing)

  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message ?? "Dados parciais inválidos",
    }
  }

  try {
    await ensureProjectAccess(projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { briefing: true },
    })

    if (!project) return { error: "Projeto não encontrado" }

    const currentBriefing = (project.briefing as Record<string, unknown>) || {}
    const updatedBriefing = { ...currentBriefing, ...validated.data }

    await prisma.project.update({
      where: { id: projectId },
      data: { briefing: updatedBriefing },
    })

    // No notifications or audit logs for partial saves to avoid noise
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Save Partial Briefing Error:")
    return { error: "Erro ao salvar progresso do briefing" }
  }
}

export async function deleteProjectAction(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.project.delete({
      where: { id },
    })

    revalidatePath("/admin/projects")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Project Error:")
    return { error: "Erro ao deletar o projeto" }
  }
}

export async function createProjectAssetAction(data: {
  projectId: string
  name: string
  url: string
  key: string
  type: AssetType
  origin?: AssetOrigin
  visibility?: AssetVisibility
  timezone?: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const actor = await getCurrentAppUser()
    const isClient = actor?.role === UserRole.CLIENT

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        name: true,
        clientId: true,
      },
    })

    if (!project) {
      return { error: "Projeto não encontrado" }
    }

    const lastAsset = await prisma.asset.findFirst({
      where: { projectId: data.projectId },
      orderBy: { order: "desc" },
    })

    const nextOrder = lastAsset ? lastAsset.order + 1 : 0

    const asset = await prisma.asset.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        url: data.url,
        key: data.key,
        type: data.type,
        timezone: data.timezone || "America/Sao_Paulo",
        order: nextOrder,
        origin:
          data.origin || (isClient ? AssetOrigin.CLIENT : AssetOrigin.ADMIN),
        visibility: data.visibility || AssetVisibility.CLIENT,
      },
    })

    await Promise.all([
      createAuditLog({
        action: "asset.created",
        entityType: "Asset",
        entityId: asset.id,
        summary: `Arquivo ${asset.name} enviado para ${project.name} por ${isClient ? "cliente" : "admin"}.`,
        actorId: actor?.id,
        actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
        projectId: data.projectId,
        metadata: {
          type: asset.type,
          origin: asset.origin,
          visibility: asset.visibility,
        },
      }),
      ...(isClient
        ? (await getInternalNotificationRecipients()).map((admin) =>
            createNotification({
              userId: admin.id,
              projectId: data.projectId,
              type: NotificationType.ASSET_UPLOADED,
              title: "Cliente enviou novo arquivo",
              message: `${actor?.name || "O cliente"} enviou "${asset.name}" para o projeto ${project.name}.`,
              ctaPath: `/admin/projects/${data.projectId}/assets`,
            })
          )
        : [
            createNotification({
              userId: project.clientId,
              projectId: data.projectId,
              type: NotificationType.ASSET_UPLOADED,
              title: "Novo arquivo disponível",
              message: `${asset.name} foi adicionado ao repositório do projeto ${project.name}.`,
              ctaPath: getDashboardPath(data.projectId),
            }),
          ]),
    ])

    revalidatePath(`/admin/projects/${data.projectId}`)
    revalidatePath(`/admin/projects/${data.projectId}/assets`)
    revalidatePath("/")
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Asset Error:")
    return { error: "Erro ao registrar arquivo" }
  }
}

export async function updateProjectAssetsOrderAction(
  projectId: string,
  assetIds: string[]
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.$transaction(
      assetIds.map((id, index) =>
        prisma.asset.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    revalidatePath(`/admin/projects/${projectId}/assets`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Assets Order Error:")
    return { error: "Erro ao atualizar ordem dos arquivos" }
  }
}

export async function createBriefingNoteAction(input: {
  projectId: string
  title: string
  content: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user, project } = await ensureProjectAccess(input.projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    const note = await prisma.briefingEntry.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        content: input.content,
        createdById: user.id,
      },
    })

    await createAuditLog({
      action: "project.briefing_note_added",
      entityType: "BriefingEntry",
      entityId: note.id,
      summary: `Nova nota de briefing "${note.title}" adicionada ao projeto ${project.name}.`,
      actorId: user.id,
      actorType: AuditActorType.USER,
      projectId: input.projectId,
    })

    if (user.role === UserRole.CLIENT) {
      const admins = await getInternalNotificationRecipients()
      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            projectId: input.projectId,
            type: NotificationType.BRIEFING_SUBMITTED,
            title: "Nova especificação de briefing",
            message: `${user.name || "O cliente"} adicionou uma nova nota ao briefing de ${project.name}.`,
            ctaPath: `/admin/projects/${input.projectId}`,
          })
        )
      )
    }

    revalidatePath("/")
    revalidatePath(`/admin/projects/${input.projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Briefing Note Error:")
    return { error: "Erro ao adicionar nota de briefing" }
  }
}
