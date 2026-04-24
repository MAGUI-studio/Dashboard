"use server"

import { NotificationType } from "@/src/generated/client/enums"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { getCurrentAppUser } from "@/src/lib/project-governance"
import {
  revalidateClientNotifications,
  revalidateProjectDecisions,
  revalidateProjectThreads,
} from "@/src/lib/revalidate"
import {
  CreateThreadSchema,
  RegisterDecisionSchema,
  ResolveMessageSchema,
  SendMessageSchema,
} from "@/src/lib/validations/communication"

export async function createThreadAction(
  data: z.infer<typeof CreateThreadSchema>
) {
  try {
    const user = await getCurrentAppUser()
    if (!user) return { error: "Unauthorized" }

    const validated = CreateThreadSchema.parse(data)

    const thread = await prisma.thread.create({
      data: {
        entityType: validated.entityType,
        entityId: validated.entityId,
        projectId: validated.projectId,
        title: validated.title,
      },
    })

    if (validated.projectId) {
      revalidateProjectThreads(validated.projectId)
    }

    return { success: true, threadId: thread.id }
  } catch (error) {
    logger.error({ error }, "Error creating thread")
    return { error: "Failed to create thread" }
  }
}

export async function sendMessageAction(
  data: z.infer<typeof SendMessageSchema>
) {
  try {
    const user = await getCurrentAppUser()
    if (!user) return { error: "Unauthorized" }

    const validated = SendMessageSchema.parse(data)

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          threadId: validated.threadId,
          content: validated.content,
          type: validated.type,
          authorId: user.id,
          attachments: validated.attachments || [],
          requiresResponse: validated.requiresResponse,
        },
        include: {
          thread: {
            include: {
              project: true,
            },
          },
        },
      })

      // Update thread timestamp
      await tx.thread.update({
        where: { id: validated.threadId },
        data: { updatedAt: new Date() },
      })

      // Create notifications for other participants
      if (msg.thread.projectId) {
        const isAdminUser = user.role === "ADMIN"

        if (isAdminUser) {
          // Notify client
          await tx.notification.create({
            data: {
              type: NotificationType.NEW_MESSAGE,
              title: "Nova mensagem no projeto",
              message: `${user.name} enviou uma mensagem: ${validated.content.substring(0, 50)}...`,
              userId: msg.thread.project!.clientId,
              projectId: msg.thread.projectId,
              ctaPath: `/portal/projects/${msg.thread.projectId}?thread=${msg.thread.id}`,
            },
          })
        } else {
          // Notify admins/members of the project
          const members = await tx.projectMember.findMany({
            where: { projectId: msg.thread.projectId },
          })

          for (const member of members) {
            await tx.notification.create({
              data: {
                type: NotificationType.NEW_MESSAGE,
                title: "Nova mensagem do cliente",
                message: `${user.name} enviou uma mensagem: ${validated.content.substring(0, 50)}...`,
                userId: member.userId,
                projectId: msg.thread.projectId,
                ctaPath: `/admin/projects/${msg.thread.projectId}?thread=${msg.thread.id}`,
              },
            })
          }
        }
      }

      return msg
    })

    if (message.thread.projectId) {
      revalidateProjectThreads(message.thread.projectId)
      revalidateClientNotifications()
    }

    return { success: true, messageId: message.id }
  } catch (error) {
    logger.error({ error }, "Error sending message")
    return { error: "Failed to send message" }
  }
}

export async function resolveMessageAction(
  data: z.infer<typeof ResolveMessageSchema>
) {
  try {
    const user = await getCurrentAppUser()
    if (!user) return { error: "Unauthorized" }

    const validated = ResolveMessageSchema.parse(data)

    const message = await prisma.message.update({
      where: { id: validated.messageId },
      data: {
        resolvedAt: new Date(),
        resolvedById: user.id,
      },
      include: {
        thread: true,
      },
    })

    if (message.thread.projectId) {
      revalidateProjectThreads(message.thread.projectId)
    }

    return { success: true }
  } catch (error) {
    logger.error({ error }, "Error resolving message")
    return { error: "Failed to resolve message" }
  }
}

export async function registerDecisionAction(
  data: z.infer<typeof RegisterDecisionSchema>
) {
  try {
    const user = await getCurrentAppUser()
    if (!user) return { error: "Unauthorized" }

    // Only admins can register formal decisions
    await protect("admin")

    const validated = RegisterDecisionSchema.parse(data)

    const decision = await prisma.decision.create({
      data: {
        projectId: validated.projectId,
        threadId: validated.threadId,
        title: validated.title,
        description: validated.description,
        decision: validated.decision,
        impactScope: validated.impactScope,
        impactDeadline: validated.impactDeadline,
        impactFinancial: validated.impactFinancial,
        decidedById: user.id,
      },
    })

    // Notify client about the registered decision
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
    })

    if (project) {
      await prisma.notification.create({
        data: {
          type: NotificationType.DECISION_REGISTERED,
          title: "Nova decisão registrada",
          message: `Uma nova decisão formal foi registrada para o projeto: ${validated.title}`,
          userId: project.clientId,
          projectId: project.id,
          ctaPath: `/portal/projects/${project.id}/decisions/${decision.id}`,
        },
      })
      revalidateProjectDecisions(project.id)
      revalidateClientNotifications()
    }

    return { success: true, decisionId: decision.id }
  } catch (error) {
    logger.error({ error }, "Error registering decision")
    return { error: "Failed to register decision" }
  }
}
