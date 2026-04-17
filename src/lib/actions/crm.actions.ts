"use server"

import { revalidatePath } from "next/cache"

import { LeadSource, LeadStatus } from "@/src/generated/client/enums"
import { Lead } from "@/src/types/crm"
import { z } from "zod"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

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

    revalidatePath("/admin/crm")
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

    revalidatePath("/admin/crm")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update lead status" }
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

    revalidatePath("/admin/crm")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete lead" }
  }
}

export async function getLeads(): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    orderBy: [{ nextActionAt: "asc" }, { createdAt: "desc" }],
  })

  return leads as unknown as Lead[]
}
