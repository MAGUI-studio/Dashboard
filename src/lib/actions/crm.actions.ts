'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/src/lib/prisma'
import { LeadStatus } from '@/src/generated/client'
import { z } from 'zod'
import { Lead } from '@/src/types/crm'

const LeadSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  notes: z.string().optional(),
  value: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
})

export async function createLead(data: z.infer<typeof LeadSchema>): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = LeadSchema.parse(data)

    await prisma.lead.create({
      data: {
        ...validatedData,
        email: validatedData.email === '' ? null : validatedData.email,
        website: validatedData.website === '' ? null : validatedData.website,
      },
    })

    revalidatePath('/admin/crm')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create lead' }
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.lead.update({
      where: { id },
      data: { status },
    })

    revalidatePath('/admin/crm')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update lead status' }
  }
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.lead.delete({
      where: { id },
    })

    revalidatePath('/admin/crm')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete lead' }
  }
}

export async function getLeads(): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })
  
  return leads as unknown as Lead[]
}
