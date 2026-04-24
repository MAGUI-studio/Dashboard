"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import {
  AuditActorType,
  NotificationType,
  Priority,
  ProjectCategory,
  ProjectMemberRole,
  ProjectStatus,
} from "@/src/generated/client/enums"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  getAuditOriginLabel,
  getCurrentAppUser,
} from "@/src/lib/project-governance"
import {
  revalidateProjectData,
  revalidateProjectStatus,
} from "@/src/lib/revalidate"
import {
  createProjectSchema,
  updateProjectStatusSchema,
} from "@/src/lib/validations/project"

import { getDashboardPath } from "./project-action-utils"

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

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: project.client.id,
          role: ProjectMemberRole.OWNER,
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
        },
      })

      await tx.notification.create({
        data: {
          userId: data.clientId,
          projectId: project.id,
          type: NotificationType.PROJECT_STATUS_CHANGED,
          title: "Novo projeto liberado no painel",
          message: `O projeto ${project.name} já está disponível para acompanhamento.`,
          ctaPath: getDashboardPath(project.id),
        },
      })

      return project
    })

    revalidateProjectData()
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
    await prisma.$transaction(async (tx) => {
      const previousProject = await tx.project.findUnique({
        where: { id },
        select: {
          status: true,
          progress: true,
        },
      })

      const project = await tx.project.update({
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

      await tx.auditLog.create({
        data: {
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
        },
      })

      await tx.notification.create({
        data: {
          userId: project.client.id,
          projectId: project.id,
          type: NotificationType.PROJECT_STATUS_CHANGED,
          title: "Status do projeto atualizado",
          message: `${project.name} avançou para ${status} com ${progress}% de progresso.`,
          ctaPath: getDashboardPath(project.id),
        },
      })
    })

    revalidateProjectStatus(id)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Project Error:")
    return { error: "Erro ao atualizar o projeto" }
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
    const actor = await getCurrentAppUser()
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    })

    if (!project) {
      return { error: "Projeto não encontrado" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          action: "project.deleted",
          entityType: "Project",
          entityId: id,
          summary: `Projeto ${project.name} deletado.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            projectName: project.name,
          },
        },
      })
    })

    revalidateProjectData()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Project Error:")
    return { error: "Erro ao deletar o projeto" }
  }
}
