"use server"

import { revalidatePath } from "next/cache"

import { LeadSource, LeadStatus } from "@/src/generated/client/enums"
import { Lead } from "@/src/types/crm"
import { z } from "zod"

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
}

export async function createLead(
  data: z.infer<typeof LeadSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = LeadSchema.parse(data)

    await prisma.lead.create({
      data: {
        ...validatedData,
        email: validatedData.email === "" ? null : validatedData.email,
        website: validatedData.website === "" ? null : validatedData.website,
        nextActionAt: validatedData.nextActionAt
          ? new Date(validatedData.nextActionAt)
          : null,
      },
    })

    revalidateCrmPaths()
    return { success: true }
  } catch {
    return { success: false, error: "Failed to create lead" }
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

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

    revalidateCrmPaths()
    return { success: true }
  } catch {
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

    revalidateCrmPaths()
    return { success: true }
  } catch {
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
  } catch {
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

    revalidateCrmPaths()
    return { success: true }
  } catch {
    return { success: false, error: "Failed to add lead note" }
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
