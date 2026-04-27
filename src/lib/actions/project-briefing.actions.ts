"use server"

import { revalidatePath } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import {
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client/enums"
import { addDays } from "date-fns"

import { triggerProductEvent } from "@/src/lib/email/events"
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
  briefing: unknown,
  tx: Prisma.TransactionClient
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (briefing as Record<string, any>) || {}
  const missingTasks = []

  if (!data.logos?.primary) {
    missingTasks.push({
      label: "Enviar logo principal da marca (Vetor/PNG)",
      type: "SYSTEM",
    })
  }

  if (!data.palette?.primary) {
    missingTasks.push({
      label: "Definir cores principais da marca (HEX)",
      type: "SYSTEM",
    })
  }

  if (!data.visualReferences || data.visualReferences.length === 0) {
    missingTasks.push({
      label: "Adicionar referências visuais e inspirações",
      type: "SYSTEM",
    })
  }

  if (!data.governance?.primaryApprover) {
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
        data: { briefing: validatedBriefing.data as Prisma.InputJsonValue },
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
          } as Prisma.InputJsonValue,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { briefing: updatedBriefing as any },
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

export async function resetProjectBriefingAction(
  projectId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user, project } = await ensureProjectAccess(projectId, [
      UserRole.ADMIN,
    ])

    await prisma.$transaction(async (tx) => {
      // Clear briefing data - Use empty object to ensure it's "not filled" but valid JSON
      await tx.project.update({
        where: { id: projectId },
        data: { briefing: {} },
      })

      // Reset kickoff checklist (using upsert to avoid failure if not exists)
      await tx.projectKickoffChecklist.upsert({
        where: { projectId },
        create: {
          projectId,
          briefingCompleted: false,
        },
        update: {
          briefingCompleted: false,
        },
      })

      await createAuditLog(
        {
          action: "project.briefing_reset",
          entityType: "Project",
          entityId: projectId,
          summary: `Briefing do projeto ${project.name} resetado para novo preenchimento.`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: AuditActorType.USER,
              role: user.role,
            }),
          },
        },
        tx
      )

      // Notify client via notification
      await tx.notification.create({
        data: {
          userId: project.clientId,
          projectId,
          type: NotificationType.OPERATIONAL_REMINDER,
          title: "Novo preenchimento de briefing solicitado",
          message: `A equipe solicitou que você preencha novamente o briefing do projeto ${project.name}.`,
          ctaPath: `/projects/${projectId}/briefing`,
        },
      })
    })

    // Trigger transactional email via Resend
    await triggerProductEvent({
      type: "BRIEFING_REQUESTED",
      projectId: projectId,
    })

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/briefing`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Reset Briefing Error:")
    return { error: "Erro ao resetar briefing" }
  }
}
