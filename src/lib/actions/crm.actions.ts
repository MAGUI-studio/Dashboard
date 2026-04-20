"use server"

import { revalidatePath } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import {
  LeadActivityType,
  LeadSource,
  LeadStatus,
  ProjectCategory,
  ProjectStatus,
} from "@/src/generated/client/enums"
import { Lead } from "@/src/types/crm"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { getCurrentAppUser } from "@/src/lib/project-governance"

const LeadSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  notes: z.string().optional(),
  value: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.OTHER),
  nextActionAt: z.string().optional(),
})

const LeadNoteSchema = z.object({
  leadId: z.string().min(1),
  content: z.string().trim().min(2).max(2000),
})

const UpdateLeadSchema = LeadSchema.extend({
  id: z.string().min(1),
})

function revalidateCrmPaths(): void {
  revalidatePath("/admin/crm")
  revalidatePath("/admin/crm/kanban")
  revalidatePath("/admin/crm/list")
  revalidatePath("/")
}

async function createLeadActivity(data: {
  leadId: string
  type: LeadActivityType
  title: string
  content?: string
  metadata?: Record<string, unknown>
}) {
  const actor = await getCurrentAppUser()
  return prisma.leadActivity.create({
    data: {
      leadId: data.leadId,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: (data.metadata || {}) as Prisma.InputJsonValue,
      authorId: actor?.id,
    },
  })
}

export async function createLead(
  data: z.infer<typeof LeadSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = LeadSchema.parse(data)

    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
        email: validatedData.email === "" ? null : validatedData.email,
        website: validatedData.website === "" ? null : validatedData.website,
        nextActionAt: validatedData.nextActionAt
          ? new Date(validatedData.nextActionAt)
          : null,
      },
    })

    await createLeadActivity({
      leadId: lead.id,
      type: LeadActivityType.LEAD_EDITED, // Initial creation
      title: "Lead catalogado no sistema",
      content: `Lead da empresa ${lead.companyName} criado com origem ${lead.source}.`,
    })

    revalidateCrmPaths()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Lead Error")
    return { success: false, error: "Failed to create lead" }
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const oldLead = await prisma.lead.findUnique({ where: { id } })
    if (!oldLead) return { success: false, error: "Lead not found" }

    await prisma.lead.update({
      where: { id },
      data: {
        status,
        lastContactAt:
          status === LeadStatus.CONTATO_REALIZADO ||
          status === LeadStatus.NEGOCIACAO
            ? new Date()
            : undefined,
      },
    })

    await createLeadActivity({
      leadId: id,
      type: LeadActivityType.STATUS_CHANGED,
      title: `Status alterado para ${status}`,
      content: `O lead foi movido de ${oldLead.status} para ${status}.`,
      metadata: { from: oldLead.status, to: status },
    })

    revalidateCrmPaths()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Lead Status Error")
    return { success: false, error: "Failed to update lead status" }
  }
}

export async function updateLead(
  data: z.infer<typeof UpdateLeadSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = UpdateLeadSchema.parse(data)

    await prisma.lead.update({
      where: { id: validatedData.id },
      data: {
        companyName: validatedData.companyName,
        contactName: validatedData.contactName || null,
        email: validatedData.email === "" ? null : validatedData.email,
        phone: validatedData.phone || null,
        website: validatedData.website === "" ? null : validatedData.website,
        instagram: validatedData.instagram || null,
        notes: validatedData.notes || null,
        value: validatedData.value || null,
        source: validatedData.source,
        nextActionAt: validatedData.nextActionAt
          ? new Date(validatedData.nextActionAt)
          : null,
      },
    })

    await createLeadActivity({
      leadId: validatedData.id,
      type: LeadActivityType.LEAD_EDITED,
      title: "Informacoes do lead atualizadas",
    })

    revalidateCrmPaths()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Lead Error")
    return { success: false, error: "Failed to update lead" }
  }
}

export async function deleteLead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    await prisma.lead.delete({
      where: { id },
    })

    revalidateCrmPaths()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Lead Error")
    return { success: false, error: "Failed to delete lead" }
  }
}

export async function addLeadNote(
  data: z.infer<typeof LeadNoteSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = LeadNoteSchema.parse(data)
    const actor = await getCurrentAppUser()

    await prisma.$transaction([
      prisma.leadNote.create({
        data: {
          leadId: validatedData.leadId,
          content: validatedData.content,
          authorId: actor?.id ?? null,
        },
      }),
      prisma.lead.update({
        where: { id: validatedData.leadId },
        data: {
          lastContactAt: new Date(),
        },
      }),
    ])

    await createLeadActivity({
      leadId: validatedData.leadId,
      type: LeadActivityType.NOTE_CREATED,
      title: "Nova nota de follow-up",
      content: validatedData.content,
    })

    revalidateCrmPaths()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Lead Note Error")
    return { success: false, error: "Failed to add lead note" }
  }
}

export async function convertLeadToProjectAction(input: {
  leadId: string
  userId?: string // If existing user
  newUserData?: {
    email: string
    name: string
    password?: string
  }
  projectData: {
    name: string
    category: ProjectCategory
    budget?: string
    deadline?: string
  }
}): Promise<{ success: boolean; error?: string; projectId?: string }> {
  try {
    await protect("admin")

    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
    })

    if (!lead) return { success: false, error: "Lead not found" }

    const finalUserId = input.userId

    // 1. Handle User creation if needed (simplified for MVP, ideally uses Clerk)
    if (!finalUserId && input.newUserData) {
      return {
        success: false,
        error:
          "User creation flow requires Clerk integration. Please select an existing client.",
      }
    }

    if (!finalUserId)
      return { success: false, error: "Client must be selected." }

    const project = await prisma.project.create({
      data: {
        name: input.projectData.name,
        category:
          (input.projectData.category as ProjectCategory) ||
          ProjectCategory.WEB_APP,
        budget: input.projectData.budget || lead.value,
        deadline: input.projectData.deadline
          ? new Date(input.projectData.deadline)
          : null,
        clientId: finalUserId,
        status: ProjectStatus.STRATEGY,
        progress: 0,
        description: lead.notes,
      },
    })

    await prisma.lead.update({
      where: { id: input.leadId },
      data: {
        status: LeadStatus.CONVERTIDO,
        convertedAt: new Date(),
        convertedProjectId: project.id,
      },
    })

    await createLeadActivity({
      leadId: input.leadId,
      type: LeadActivityType.CONVERTED_TO_PROJECT,
      title: "Lead convertido em projeto",
      content: `Projeto "${project.name}" criado com sucesso.`,
      metadata: { projectId: project.id } as unknown as Prisma.InputJsonValue,
    })

    revalidateCrmPaths()
    revalidatePath("/admin/projects")

    return { success: true, projectId: project.id }
  } catch (error) {
    logger.error({ error }, "Convert Lead Error")
    return { success: false, error: "Failed to convert lead" }
  }
}

export async function getLeads(): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    where: {
      status: {
        not: LeadStatus.DESCARTADO,
      },
    },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      },
      followUpNotes: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          authorId: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ nextActionAt: "asc" }, { createdAt: "desc" }],
  })

  return leads as unknown as Lead[]
}
