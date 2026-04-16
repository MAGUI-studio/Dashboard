"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import { AssetType } from "@/src/generated/prisma"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  addProjectTimelineSchema,
  createProjectSchema,
  updateProjectStatusSchema,
} from "@/src/lib/validations/project"

export async function createProjectAction(formData: FormData) {
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
          description: data.projectDescription,
          budget: data.budget,
          deadline: data.deadline ? new Date(data.deadline) : null,
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
    console.error("Create Project Error:", error)
    const message =
      error instanceof Error ? error.message : "Erro ao criar o projeto"
    return { error: message }
  }
}

export async function updateProjectStatusAction(formData: FormData) {
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
      data: { status, progress },
    })

    revalidatePath(`/admin/projects/${id}`)
    revalidatePath("/admin/projects")
    return { success: true }
  } catch (error) {
    console.error("Update Project Error:", error)
    return { error: "Erro ao atualizar o projeto" }
  }
}

export async function addProjectTimelineAction(formData: FormData) {
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
    timezone: formData.get("timezone"),
  })

  if (!validatedFields.success) {
    return { error: "Dados inválidos" }
  }

  const { projectId, title, description, isMilestone, timezone } =
    validatedFields.data

  try {
    await prisma.update.create({
      data: {
        projectId,
        title,
        description,
        isMilestone,
        timezone,
      },
    })

    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Add Timeline Error:", error)
    return { error: "Erro ao adicionar atualização" }
  }
}

export async function deleteProjectAction(id: string) {
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
    console.error("Delete Project Error:", error)
    return { error: "Erro ao deletar o projeto" }
  }
}

export async function createProjectAssetAction(data: {
  projectId: string
  name: string
  url: string
  key: string
  type: AssetType
}) {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.asset.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        url: data.url,
        key: data.key,
        type: data.type,
      },
    })

    revalidatePath(`/admin/projects/${data.projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Create Asset Error:", error)
    return { error: "Erro ao registrar arquivo" }
  }
}

export async function deleteProjectAssetAction(id: string, projectId: string) {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.asset.delete({
      where: { id },
    })

    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete Asset Error:", error)
    return { error: "Erro ao deletar arquivo" }
  }
}
