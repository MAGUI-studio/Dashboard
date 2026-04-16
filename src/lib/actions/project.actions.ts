"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { createProjectSchema } from "@/src/lib/validations/project"

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
