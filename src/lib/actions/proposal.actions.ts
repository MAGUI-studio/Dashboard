"use server"

import { revalidatePath } from "next/cache"

import { ProposalStatus } from "@/src/generated/client"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  enqueueEvent,
  getCurrentAppUser,
} from "@/src/lib/project-governance"
import { revalidateCrmLead } from "@/src/lib/revalidate"

const ProposalItemSchema = z.object({
  description: z.string().min(3),
  longDescription: z.string().optional(),
  unitValue: z.number().min(0),
  quantity: z.number().min(1),
  order: z.number().default(0),
})

const CreateProposalSchema = z.object({
  leadId: z.string(),
  title: z.string().min(5),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().default("BRL"),
  items: z.array(ProposalItemSchema).min(1),
})

export async function createProposalAction(
  data: z.infer<typeof CreateProposalSchema>
) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()
    const validated = CreateProposalSchema.parse(data)

    const result = await prisma.$transaction(async (tx) => {
      const totalValue = validated.items.reduce(
        (acc, item) => acc + item.unitValue * item.quantity,
        0
      )

      const proposal = await tx.proposal.create({
        data: {
          leadId: validated.leadId,
          title: validated.title,
          validUntil: validated.validUntil
            ? new Date(validated.validUntil)
            : null,
          totalValue,
          currency: validated.currency,
          notes: validated.notes,
          items: {
            create: validated.items,
          },
        },
        include: {
          lead: { select: { companyName: true } },
        },
      })

      await createAuditLog(
        {
          action: "proposal.created",
          entityType: "Proposal",
          entityId: proposal.id,
          summary: `Proposta "${proposal.title}" criada para ${proposal.lead.companyName}.`,
          actorId: actor?.id,
          projectId: null,
          metadata: { totalValue },
        },
        tx
      )

      return proposal
    })

    revalidateCrmLead(validated.leadId)
    return { success: true, proposal: result }
  } catch (error) {
    logger.error({ error }, "Create Proposal Error")
    return { success: false, error: "Falha ao criar proposta" }
  }
}

export async function updateProposalStatusAction(
  id: string,
  status: ProposalStatus
) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const proposal = await prisma.$transaction(async (tx) => {
      const p = await tx.proposal.update({
        where: { id },
        data: { status },
        include: {
          lead: { select: { id: true, companyName: true, value: true } },
        },
      })

      await createAuditLog(
        {
          action: "proposal.status_changed",
          entityType: "Proposal",
          entityId: id,
          summary: `Status da proposta "${p.title}" alterado para ${status}.`,
          actorId: actor?.id,
          metadata: { status },
        },
        tx
      )

      if (status === ProposalStatus.ACCEPTED) {
        await enqueueEvent(tx, {
          type: "NOTIFICATION",
          payload: {
            type: "PROPOSAL_ACCEPTED",
            proposalId: id,
            leadId: p.leadId,
            value: p.totalValue,
          },
        })
      }

      return p
    })

    revalidateCrmLead(proposal.leadId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Proposal Status Error")
    return { success: false, error: "Falha ao atualizar status da proposta" }
  }
}

export async function deleteProposalAction(id: string) {
  try {
    await protect("admin")

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { leadId: true },
    })

    if (!proposal) throw new Error("Proposal not found")

    await prisma.proposal.delete({ where: { id } })

    revalidateCrmLead(proposal.leadId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Proposal Error")
    return { success: false, error: "Falha ao excluir proposta" }
  }
}

export async function getLeadProposalsAction(leadId: string) {
  try {
    await protect("admin")
    const proposals = await prisma.proposal.findMany({
      where: { leadId },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, proposals }
  } catch (error) {
    logger.error({ error }, "Get Proposals Action Error")
    return {
      success: false,
      error: "Falha ao carregar propostas",
      proposals: [],
    }
  }
}
