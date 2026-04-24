"use server"

import { revalidatePath } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import {
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client/enums"
import { addDays } from "date-fns"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotificationsMany,
  ensureProjectAccess,
  getAuditOriginLabel,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import { briefingSchema } from "@/src/lib/validations/project"

async function verifyAndCreateMissingBriefingTasks(
  projectId: string,
  briefing: Prisma.InputJsonValue,
  tx: Prisma.TransactionClient
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = briefing as any
  const missingTasks = []

  if (!data.logos?.primary) {
    missingTasks.push({
      label: "Enviar logo principal da marca (Vetor/PNG)",
      type: "SYSTEM",
    })
  }

  if (!briefing.palette?.primary) {
    missingTasks.push({
      label: "Definir cores principais da marca (HEX)",
      type: "SYSTEM",
    })
  }

  if (!briefing.visualReferences || briefing.visualReferences.length === 0) {
    missingTasks.push({
      label: "Adicionar referências visuais e inspirações",
      type: "SYSTEM",
    })
  }

  if (!briefing.governance?.primaryApprover) {
    missingTasks.push({
      label: "Definir aprovador oficial do projeto",
      type: "SYSTEM",
    })
  }

  if (missingTasks.length > 0) {
    for (const task of missingTasks) {
      // Check if task already exists to avoid duplicates
      const exists = await tx.actionItem.findFirst({
        where: { projectId, title: task.label, status: "PENDING" },
      })

      if (!exists) {
        await tx.actionItem.create({
          data: {
            projectId,
            title: task.label,
            description:
              "Item obrigatório para avanço operacional identificado via briefing.",
            status: "PENDING",
            dueDate: addDays(new Date(), 2),
            targetRole: "CLIENT",
          },
        })
      }
    }
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

    await prisma.$transaction(async (tx) => {
      const previousProject = await tx.project.findUnique({
        where: { id: projectId },
        select: { briefing: true },
      })

      await tx.project.update({
        where: { id: projectId },
        data: { briefing: validatedBriefing.data },
      })

      // Verify missing critical data and create tasks
      await verifyAndCreateMissingBriefingTasks(
        projectId,
        validatedBriefing.data,
        tx
      )

      await createAuditLog(
        {
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
        },
        tx
      )

      if (user.role === UserRole.CLIENT) {
        const admins = await getInternalNotificationRecipients()
        await createNotificationsMany(
          admins.map((admin) => ({
            userId: admin.id,
            projectId,
            type: NotificationType.BRIEFING_SUBMITTED,
            title: "Briefing enviado",
            message: `${project.client.name ?? "O cliente"} atualizou o briefing de ${project.name}.`,
            ctaPath: `/admin/projects/${projectId}`,
          })),
          tx
        )
      }
    })

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

    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { briefing: true },
      })

      if (!project) throw new Error("Project not found")

      const currentBriefing =
        (project.briefing as Record<string, unknown>) || {}
      const updatedBriefing = { ...currentBriefing, ...validated.data }

      await tx.project.update({
        where: { id: projectId },
        data: { briefing: updatedBriefing },
      })
    })

    return { success: true }
  } catch (error) {
    logger.error({ error }, "Save Partial Briefing Error:")
    return { error: "Erro ao salvar progresso do briefing" }
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

    await prisma.$transaction(async (tx) => {
      const note = await tx.briefingEntry.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          content: input.content,
          createdById: user.id,
        },
      })

      await createAuditLog(
        {
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
        },
        tx
      )

      if (user.role === UserRole.CLIENT) {
        const admins = await getInternalNotificationRecipients()
        await createNotificationsMany(
          admins.map((admin) => ({
            userId: admin.id,
            projectId: input.projectId,
            type: NotificationType.BRIEFING_SUBMITTED,
            title: "Nova especificação de briefing",
            message: `${user.name || "O cliente"} adicionou uma nova nota ao briefing de ${project.name}.`,
            ctaPath: `/admin/projects/${input.projectId}`,
          })),
          tx
        )
      }
    })

    revalidatePath("/")
    revalidatePath(`/admin/projects/${input.projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Briefing Note Error:")
    return { error: "Erro ao adicionar nota de briefing" }
  }
}

export async function addBriefingNoteAction(input: {
  projectId: string
  title: string
  content: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user } = await ensureProjectAccess(input.projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.$transaction(async (tx) => {
      await tx.briefingEntry.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          content: input.content,
          createdById: user.id,
        },
      })

      await createAuditLog(
        {
          action: "project.briefing_note.created",
          entityType: "BriefingNote",
          entityId: input.projectId,
          summary: `Nova nota de briefing adicionada: "${input.title}".`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId: input.projectId,
          metadata: {
            title: input.title,
          },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath(`/projects/${input.projectId}/briefing`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Briefing Note Error:")
    return { error: "Erro ao adicionar nota de briefing" }
  }
}
