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
  ApprovalStatus,
  AssetOrigin,
  AssetVisibility,
  AuditActorType,
  NotificationType,
  ProjectMemberRole,
  UserRole,
} from "@/src/generated/client/enums"
import { UTApi } from "uploadthing/server"

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

const approvalStatusLabels: Record<ApprovalStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
}

function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return ""
  }

  const normalized =
    value instanceof Date ? value.toISOString() : String(value).trim()

  return `"${normalized.replace(/"/g, '""')}"`
}

function toBrazilianDate(value: Date | string | null | undefined): string {
  if (!value) return ""

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value))
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
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

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: project.client.id,
        role: ProjectMemberRole.OWNER,
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
        origin: getAuditOriginLabel({
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          role: actor?.role,
        }),
        category: project.category,
        priority: project.priority,
        initialUpdateId: initialUpdate.id,
        after: {
          status: project.status,
          progress: project.progress,
          category: project.category,
          priority: project.priority,
          budget: project.budget,
          deadline: project.deadline?.toISOString() ?? null,
        },
        relatedEntities: [
          {
            type: "Project",
            id: project.id,
            label: project.name,
          },
          {
            type: "Client",
            id: project.client.id,
            label: project.client.name ?? "Cliente",
          },
          {
            type: "Update",
            id: initialUpdate.id,
            label: initialUpdate.title,
          },
        ],
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
    const previousProject = await prisma.project.findUnique({
      where: { id },
      select: {
        status: true,
        progress: true,
      },
    })

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
        metadata: {
          origin: getAuditOriginLabel({
            actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
            role: actor?.role,
          }),
          before: previousProject
            ? {
                status: previousProject.status,
                progress: previousProject.progress,
              }
            : null,
          after: {
            status,
            progress,
          },
          relatedEntities: [
            {
              type: "Project",
              id: project.id,
              label: project.name,
            },
          ],
        },
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

    const previousProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { briefing: true },
    })

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
        metadata: {
          origin: getAuditOriginLabel({
            actorType: AuditActorType.USER,
            role: user.role,
          }),
          before: {
            briefing: previousProject?.briefing ?? null,
          },
          after: {
            briefing: validatedBriefing.data,
          },
          relatedEntities: [
            {
              type: "Project",
              id: project.id,
              label: project.name,
            },
          ],
        },
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

export async function deleteProjectAssetAction(
  id: string,
  projectId: string,
  key: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const utapi = new UTApi()

  try {
    await utapi.deleteFiles(key)

    await prisma.asset.delete({
      where: { id },
    })

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath(`/admin/projects/${projectId}/assets`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Asset Error:")
    return { error: "Erro ao deletar arquivo" }
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
          origin: getAuditOriginLabel({
            actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
            role: actor?.role,
          }),
          type: asset.type,
          assetOrigin: asset.origin,
          visibility: asset.visibility,
          after: {
            type: asset.type,
            assetOrigin: asset.origin,
            visibility: asset.visibility,
            order: asset.order,
          },
          relatedEntities: [
            {
              type: "Project",
              id: project.id,
              label: project.name,
            },
            {
              type: "Asset",
              id: asset.id,
              label: asset.name,
            },
          ],
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
      metadata: {
        origin: getAuditOriginLabel({
          actorType: AuditActorType.USER,
          role: user.role,
        }),
        after: {
          title: note.title,
          content: note.content,
        },
        relatedEntities: [
          {
            type: "Project",
            id: project.id,
            label: project.name,
          },
          {
            type: "BriefingEntry",
            id: note.id,
            label: note.title,
          },
        ],
      },
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

export async function exportProjectApprovalsCsvAction(
  projectId: string
): Promise<{
  success: boolean
  filename?: string
  csv?: string
  error?: string
}> {
  try {
    await protect("admin")

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    })

    if (!project) {
      return { success: false, error: "Projeto não encontrado" }
    }

    const events = await prisma.approvalEvent.findMany({
      where: {
        update: {
          projectId,
        },
      },
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        update: {
          select: {
            title: true,
            approvalStatus: true,
            requiresApproval: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const headers = [
      "Projeto",
      "Entrega",
      "Decisão",
      "Comentário",
      "Responsável",
      "Email",
      "Perfil",
      "Status atual",
      "Data",
    ]

    const rows = events.map((event) => [
      project.name,
      event.update.title,
      approvalStatusLabels[event.decision],
      event.comment,
      event.actor?.name ?? "Sistema",
      event.actor?.email ?? "",
      event.actor?.role ?? "",
      approvalStatusLabels[event.update.approvalStatus],
      toBrazilianDate(event.createdAt),
    ])

    const csv = [
      headers.map(toCsvCell).join(","),
      ...rows.map((row) => row.map(toCsvCell).join(",")),
    ].join("\r\n")

    const safeProjectName = project.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
    const date = new Date().toISOString().slice(0, 10)

    return {
      success: true,
      filename: `aprovacoes-${safeProjectName || project.id}-${date}.csv`,
      csv: `\uFEFF${csv}`,
    }
  } catch (error) {
    logger.error({ error }, "Export Project Approvals CSV Error")
    return { success: false, error: "Erro ao exportar aprovações" }
  }
}

export async function exportProjectApprovalsHtmlAction(
  projectId: string
): Promise<{
  success: boolean
  filename?: string
  html?: string
  error?: string
}> {
  try {
    await protect("admin")

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        client: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    })

    if (!project) {
      return { success: false, error: "Projeto não encontrado" }
    }

    const events = await prisma.approvalEvent.findMany({
      where: {
        update: {
          projectId,
        },
      },
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        update: {
          select: {
            title: true,
            approvalStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const safeProjectName = project.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()

    const rows = events
      .map(
        (event) => `<tr>
          <td>${escapeHtml(event.update.title)}</td>
          <td>${escapeHtml(approvalStatusLabels[event.decision])}</td>
          <td>${escapeHtml(event.comment || "")}</td>
          <td>${escapeHtml(event.actor?.name ?? event.actor?.email ?? "Sistema")}</td>
          <td>${escapeHtml(toBrazilianDate(event.createdAt))}</td>
        </tr>`
      )
      .join("")

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Aprovações - ${escapeHtml(project.name)}</title>
  <style>
    :root {
      --ink: oklch(0.18 0.02 250);
      --muted: oklch(0.5 0.02 250);
      --line: oklch(0.9 0.01 250);
      --paper: oklch(0.99 0.003 250);
      --brand: oklch(0.57 0.15 245);
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: ui-sans-serif, system-ui, sans-serif; }
    main { max-width: 960px; margin: 0 auto; padding: 56px 40px; }
    .eyebrow { color: var(--brand); font-size: 11px; font-weight: 900; letter-spacing: .24em; text-transform: uppercase; }
    h1 { margin: 10px 0 12px; font-size: 42px; line-height: .95; letter-spacing: -.05em; text-transform: uppercase; }
    p { margin: 0; color: var(--muted); }
    table { width: 100%; margin-top: 36px; border-collapse: collapse; background: white; border: 1px solid var(--line); border-radius: 22px; overflow: hidden; }
    th { text-align: left; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); background: oklch(0.96 0.006 250); }
    th, td { padding: 16px; border-bottom: 1px solid var(--line); vertical-align: top; }
    td { font-size: 13px; }
    tr:last-child td { border-bottom: 0; }
    @media print { main { padding: 24px; } table { break-inside: auto; } tr { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">Histórico de aprovações</div>
    <h1>${escapeHtml(project.name)}</h1>
    <p>${escapeHtml(project.client.companyName || project.client.name || project.client.email)}</p>
    <table>
      <thead>
        <tr>
          <th>Entrega</th>
          <th>Decisão</th>
          <th>Comentário</th>
          <th>Responsável</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="5">Nenhuma aprovação registrada.</td></tr>'}
      </tbody>
    </table>
  </main>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`

    return {
      success: true,
      filename: `aprovacoes-${safeProjectName || project.id}.html`,
      html,
    }
  } catch (error) {
    logger.error({ error }, "Export Project Approvals HTML Error")
    return { success: false, error: "Erro ao exportar aprovações" }
  }
}

export async function exportProjectSummaryHtmlAction(
  projectId: string
): Promise<{
  success: boolean
  filename?: string
  html?: string
  error?: string
}> {
  try {
    await protect("admin")

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            companyName: true,
            phone: true,
          },
        },
        updates: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            title: true,
            description: true,
            requiresApproval: true,
            approvalStatus: true,
            createdAt: true,
          },
        },
        actionItems: {
          orderBy: { dueDate: "asc" },
          take: 10,
          select: {
            title: true,
            status: true,
            dueDate: true,
            targetRole: true,
          },
        },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            name: true,
            description: true,
            deployUrl: true,
            createdAt: true,
          },
        },
      },
    })

    if (!project) {
      return { success: false, error: "Projeto não encontrado" }
    }

    const safeProjectName = project.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resumo - ${escapeHtml(project.name)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: oklch(0.18 0.02 250);
      --muted: oklch(0.48 0.02 250);
      --line: oklch(0.9 0.01 250);
      --paper: oklch(0.99 0.003 250);
      --soft: oklch(0.96 0.006 250);
      --brand: oklch(0.57 0.15 245);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main { max-width: 920px; margin: 0 auto; padding: 56px 40px; }
    header { border-bottom: 1px solid var(--line); padding-bottom: 28px; margin-bottom: 32px; }
    .eyebrow { color: var(--brand); font-size: 11px; font-weight: 900; letter-spacing: .24em; text-transform: uppercase; }
    h1 { margin: 10px 0 12px; font-size: 44px; line-height: .95; letter-spacing: -.05em; text-transform: uppercase; }
    h2 { margin: 0 0 16px; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; }
    p { margin: 0; color: var(--muted); }
    section { border: 1px solid var(--line); border-radius: 24px; padding: 24px; margin-bottom: 18px; background: white; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .metric { border-radius: 18px; background: var(--soft); padding: 16px; }
    .label { color: var(--muted); font-size: 10px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
    .value { margin-top: 6px; color: var(--ink); font-weight: 800; }
    .item { padding: 14px 0; border-top: 1px solid var(--line); }
    .item:first-of-type { border-top: 0; padding-top: 0; }
    .title { color: var(--ink); font-weight: 850; }
    .meta { margin-top: 4px; font-size: 12px; }
    @media print {
      main { padding: 24px; }
      section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">Resumo do projeto</div>
      <h1>${escapeHtml(project.name)}</h1>
      <p>${escapeHtml(project.description || "Sem descrição cadastrada.")}</p>
    </header>

    <section>
      <h2>Dados principais</h2>
      <div class="grid">
        <div class="metric"><div class="label">Cliente</div><div class="value">${escapeHtml(project.client.companyName || project.client.name || project.client.email)}</div></div>
        <div class="metric"><div class="label">Status</div><div class="value">${escapeHtml(project.status)}</div></div>
        <div class="metric"><div class="label">Progresso</div><div class="value">${project.progress}%</div></div>
        <div class="metric"><div class="label">Prazo</div><div class="value">${escapeHtml(toBrazilianDate(project.deadline)) || "Sem prazo"}</div></div>
        <div class="metric"><div class="label">Investimento</div><div class="value">${escapeHtml(project.budget || "Não informado")}</div></div>
        <div class="metric"><div class="label">Gerado em</div><div class="value">${escapeHtml(toBrazilianDate(new Date()))}</div></div>
      </div>
    </section>

    <section>
      <h2>Últimas atualizações</h2>
      ${
        project.updates
          .map(
            (update) =>
              `<div class="item"><div class="title">${escapeHtml(update.title)}</div><p>${escapeHtml(update.description || "")}</p><div class="meta">${escapeHtml(toBrazilianDate(update.createdAt))} · ${escapeHtml(update.approvalStatus)}</div></div>`
          )
          .join("") || "<p>Nenhuma atualização registrada.</p>"
      }
    </section>

    <section>
      <h2>Pendências</h2>
      ${
        project.actionItems
          .map(
            (item) =>
              `<div class="item"><div class="title">${escapeHtml(item.title)}</div><div class="meta">${escapeHtml(item.status)} · ${escapeHtml(item.targetRole)} · ${escapeHtml(toBrazilianDate(item.dueDate)) || "Sem prazo"}</div></div>`
          )
          .join("") || "<p>Nenhuma pendência registrada.</p>"
      }
    </section>

    <section>
      <h2>Versões</h2>
      ${
        project.versions
          .map(
            (version) =>
              `<div class="item"><div class="title">${escapeHtml(version.name)}</div><p>${escapeHtml(version.description || "")}</p><div class="meta">${escapeHtml(toBrazilianDate(version.createdAt))}${version.deployUrl ? ` · ${escapeHtml(version.deployUrl)}` : ""}</div></div>`
          )
          .join("") || "<p>Nenhuma versão registrada.</p>"
      }
    </section>
  </main>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`

    return {
      success: true,
      filename: `resumo-${safeProjectName || project.id}.html`,
      html,
    }
  } catch (error) {
    logger.error({ error }, "Export Project Summary HTML Error")
    return { success: false, error: "Erro ao exportar resumo do projeto" }
  }
}

export async function addProjectMemberAction(input: {
  projectId: string
  userId: string
  role?: ProjectMemberRole
}): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const [project, user] = await Promise.all([
      prisma.project.findUnique({
        where: { id: input.projectId },
        select: {
          id: true,
          name: true,
          clientId: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ])

    if (!project) {
      return { success: false, error: "Projeto não encontrado" }
    }

    if (!user || user.role !== UserRole.CLIENT) {
      return { success: false, error: "Selecione um cliente válido" }
    }

    const role =
      project.clientId === user.id ? ProjectMemberRole.OWNER : input.role

    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: input.projectId,
          userId: input.userId,
        },
      },
      update: {
        role: role ?? ProjectMemberRole.COLLABORATOR,
      },
      create: {
        projectId: input.projectId,
        userId: input.userId,
        role: role ?? ProjectMemberRole.COLLABORATOR,
      },
    })

    await createAuditLog({
      action: "project.member_added",
      entityType: "ProjectMember",
      entityId: input.userId,
      summary: `${user.name ?? user.email} adicionado ao projeto ${project.name}.`,
      actorId: actor?.id,
      actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
      projectId: input.projectId,
      metadata: {
        origin: getAuditOriginLabel({
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          role: actor?.role,
        }),
        after: {
          role: role ?? ProjectMemberRole.COLLABORATOR,
          userId: user.id,
          email: user.email,
        },
        relatedEntities: [
          {
            type: "Project",
            id: project.id,
            label: project.name,
          },
          {
            type: "User",
            id: user.id,
            label: user.name ?? user.email,
          },
        ],
      },
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Project Member Error")
    return { success: false, error: "Erro ao adicionar colaborador" }
  }
}

export async function removeProjectMemberAction(input: {
  projectId: string
  userId: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: input.projectId,
          userId: input.userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!membership) {
      return { success: false, error: "Colaborador não encontrado" }
    }

    if (membership.project.clientId === input.userId) {
      return {
        success: false,
        error: "O cliente principal não pode ser removido por aqui",
      }
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: input.projectId,
          userId: input.userId,
        },
      },
    })

    await createAuditLog({
      action: "project.member_removed",
      entityType: "ProjectMember",
      entityId: input.userId,
      summary: `${membership.user.name ?? membership.user.email} removido do projeto ${membership.project.name}.`,
      actorId: actor?.id,
      actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
      projectId: input.projectId,
      metadata: {
        origin: getAuditOriginLabel({
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          role: actor?.role,
        }),
        before: {
          role: membership.role,
          userId: membership.user.id,
          email: membership.user.email,
        },
        relatedEntities: [
          {
            type: "Project",
            id: membership.project.id,
            label: membership.project.name,
          },
          {
            type: "User",
            id: membership.user.id,
            label: membership.user.name ?? membership.user.email,
          },
        ],
      },
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Remove Project Member Error")
    return { success: false, error: "Erro ao remover colaborador" }
  }
}
