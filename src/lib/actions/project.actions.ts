"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import {
  AssetType,
  Prisma,
  Priority,
  ProjectCategory,
  ProjectStatus,
} from "@/src/generated/client"
import { UTApi } from "uploadthing/server"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  addProjectTimelineSchema,
  createProjectSchema,
  updateProjectStatusSchema,
} from "@/src/lib/validations/project"

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
          status: "STRATEGY",
          progress: 0,
        },
      })

      await tx.update.create({
        data: {
          title: "Projeto Iniciado",
          description: "Fase de Estratégia iniciada com sucesso.",
          projectId: project.id,
          isMilestone: true,
          timezone: (formData.get("timezone") as string) || "America/Sao_Paulo",
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

  try {
    await prisma.project.update({
      where: { id },
      data: {
        status: status as ProjectStatus,
        progress,
      },
    })

    revalidatePath(`/admin/projects/${id}`)
    revalidatePath("/admin/projects")
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
    await prisma.update.create({
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
    })

    revalidatePath(`/admin/projects/${projectId}`)
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
    await protect("client")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.update.update({
      where: { id: updateId },
      data: {
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
      },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Approve Update Error:")
    return { error: "Erro ao aprovar atualização" }
  }
}

export async function updateProjectBriefingAction(
  projectId: string,
  briefing: Prisma.InputJsonValue
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("client")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { briefing: briefing || {} },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/")
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

  try {
    const lastAsset = await prisma.asset.findFirst({
      where: { projectId: data.projectId },
      orderBy: { order: "desc" },
    })

    const nextOrder = lastAsset ? lastAsset.order + 1 : 0

    await prisma.asset.create({
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

    revalidatePath(`/admin/projects/${data.projectId}`)
    revalidatePath(`/admin/projects/${data.projectId}/assets`)
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
