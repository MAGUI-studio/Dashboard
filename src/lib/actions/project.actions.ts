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
  AuditActorType,
  NotificationType,
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
  getCurrentAppUser,
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
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
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

      const initialUpdate = await tx.update.create({
        data: {
          title: "Projeto iniciado",
          description: "Fase de estratégia iniciada com sucesso.",
          projectId: project.id,
          isMilestone: true,
          timezone: (formData.get("timezone") as string) || "America/Sao_Paulo",
        },
      })

      await tx.auditLog.create({
        data: {
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
        },
      })

      await tx.notification.create({
        data: {
          userId: project.clientId,
          projectId: project.id,
          type: NotificationType.PROJECT_STATUS_CHANGED,
          title: "Novo projeto liberado no painel",
          message: `O projeto ${project.name} já está disponível para acompanhamento.`,
          ctaPath: getDashboardPath(project.id),
        },
      })
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
    return { error: "Dados inválidos" }
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

  const validatedFields = addProjectTimelineSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    isMilestone: formData.get("isMilestone") === "true",
    requiresApproval: formData.get("requiresApproval") === "true",
    imageUrl: formData.get("imageUrl"),
    timezone: formData.get("timezone"),
  })

  if (!validatedFields.success) {
    return { error: "Dados inválidos" }
  }

  const actor = await getCurrentAppUser()
  const {
    projectId,
    title,
    description,
    isMilestone,
    requiresApproval,
    imageUrl,
    timezone,
  } = validatedFields.data

  try {
    const update = await prisma.update.create({
      data: {
        projectId,
        title,
        description: description ?? null,
        isMilestone,
        requiresApproval,
        approvalStatus: requiresApproval ? "PENDING" : "APPROVED",
        imageUrl: imageUrl || null,
        timezone,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientId: true,
          },
        },
      },
    })

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
        metadata: { updateId: update.id },
      })
    }

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Timeline Error:")
    return { error: "Erro ao adicionar atualização" }
  }
}

export async function approveUpdateAction(
  updateId: string,
  projectId: string
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
    })

    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.MEMBER] },
      },
      select: { id: true },
    })

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          projectId,
          type: NotificationType.UPDATE_APPROVED,
          title: "Milestone aprovada",
          message: `${project.client.name ?? "O cliente"} aprovou "${update.title}".`,
          ctaPath: `/admin/projects/${projectId}`,
          metadata: { updateId: update.id },
        })
      )
    )

    revalidatePath("/")
    revalidatePath(`/admin/projects/${projectId}`)
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

    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.MEMBER] },
      },
      select: { id: true },
    })

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          projectId: validated.data.projectId,
          type: NotificationType.UPDATE_REJECTED,
          title: "Milestone precisa de ajustes",
          message: `${project.client.name ?? "O cliente"} enviou feedback em "${update.title}".`,
          ctaPath: `/admin/projects/${validated.data.projectId}`,
          metadata: {
            updateId: update.id,
            feedback: validated.data.feedback,
          },
        })
      )
    )

    revalidatePath("/")
    revalidatePath(`/admin/projects/${validated.data.projectId}`)
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
  timezone?: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const actor = await getCurrentAppUser()

  try {
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
      },
    })

    await Promise.all([
      createAuditLog({
        action: "asset.created",
        entityType: "Asset",
        entityId: asset.id,
        summary: `Arquivo ${asset.name} enviado para ${project.name}.`,
        actorId: actor?.id,
        actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
        projectId: data.projectId,
        metadata: { type: asset.type },
      }),
      createNotification({
        userId: project.clientId,
        projectId: data.projectId,
        type: NotificationType.ASSET_UPLOADED,
        title: "Novo arquivo disponível",
        message: `${asset.name} foi adicionado ao repositório do projeto ${project.name}.`,
        ctaPath: getDashboardPath(data.projectId),
      }),
    ])

    revalidatePath(`/admin/projects/${data.projectId}`)
    revalidatePath(`/admin/projects/${data.projectId}/assets`)
    revalidatePath("/")
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
