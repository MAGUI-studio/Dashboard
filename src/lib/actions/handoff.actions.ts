"use server"

import {
  LeadActivityType,
  LeadStatus,
  NotificationType,
  Prisma,
  ProjectCategory,
  ProjectStatus,
  ProposalStatus,
} from "@/src/generated/client"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  findOrCreateClientFromEmail,
} from "@/src/lib/project-governance"
import {
  revalidateCrmLead,
  revalidateCrmLeads,
  revalidateProjectData,
} from "@/src/lib/revalidate"

export async function processProjectHandoffAction(proposalId: string) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        lead: true,
        items: true,
      },
    })

    if (!proposal) throw new Error("Proposal not found")
    if (proposal.status !== ProposalStatus.ACCEPTED) {
      throw new Error("Only accepted proposals can be handed off to operation")
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure client user exists
      const clientEmail = proposal.lead.email
      if (!clientEmail) throw new Error("Lead must have an email for handoff")

      const clientUser = await findOrCreateClientFromEmail(
        {
          email: clientEmail,
          name: proposal.lead.contactName || proposal.lead.companyName,
          companyName: proposal.lead.companyName,
        },
        tx
      )

      // 2. Create the Project
      const project = await tx.project.create({
        data: {
          name: proposal.title,
          clientId: clientUser.id,
          category: ProjectCategory.LANDING_PAGE, // Default aligned with current offering
          budget: proposal.totalValue,
          status: ProjectStatus.STRATEGY,
          description: proposal.notes,
          progress: 0,
        },
      })

      // 3. Create the Handoff record (Commercial Snapshot)
      await tx.projectHandoff.create({
        data: {
          projectId: project.id,
          proposalId: proposal.id,
          proposalTitle: proposal.title,
          finalValue: proposal.totalValue,
          currency: proposal.currency,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          soldItems: proposal.items as unknown as any,
          commercialNotes: proposal.notes,
          status: "COMPLETED",
        },
      })

      // 4. Create the Kickoff Checklist
      await tx.projectKickoffChecklist.create({
        data: {
          projectId: project.id,
          contractSigned: true, // Assuming acceptance is enough for now, or link to contract later
          items: [
            {
              id: "1",
              label: "Contrato assinado",
              completed: true,
              type: "SYSTEM",
            },
            {
              id: "2",
              label: "Briefing preenchido",
              completed: false,
              type: "SYSTEM",
            },
            {
              id: "3",
              label: "Logos e ativos de marca enviados",
              completed: false,
              type: "SYSTEM",
            },
            {
              id: "4",
              label: "Acessos técnicos recebidos",
              completed: false,
              type: "SYSTEM",
            },
            {
              id: "5",
              label: "Reunião de kickoff agendada",
              completed: false,
              type: "SYSTEM",
            },
          ],
        },
      })

      // 5. Update Lead Status
      await tx.lead.update({
        where: { id: proposal.leadId },
        data: {
          status: LeadStatus.CONVERTIDO,
          convertedAt: new Date(),
          convertedProjectId: project.id,
        },
      })

      // 6. Link Proposal to Project
      await tx.proposal.update({
        where: { id: proposal.id },
        data: { projectId: project.id },
      })

      // 7. Audit and Activities
      await tx.leadActivity.create({
        data: {
          leadId: proposal.leadId,
          type: LeadActivityType.CONVERTED_TO_PROJECT,
          title: "Handoff operacional concluído",
          content: `Projeto "${project.name}" criado a partir da proposta #${proposal.number}.`,
          metadata: { projectId: project.id, proposalId: proposal.id },
        },
      })

      await createAuditLog(
        {
          action: "project.handoff_completed",
          entityType: "Project",
          entityId: project.id,
          summary: `Handoff concluído para o projeto ${project.name} via proposta #${proposal.number}.`,
          projectId: project.id,
          metadata: { proposalId: proposal.id, clientId: clientUser.id },
        },
        tx
      )

      // 8. Notify Client
      await tx.notification.create({
        data: {
          userId: clientUser.id,
          projectId: project.id,
          type: NotificationType.PROJECT_STATUS_CHANGED,
          title: "Bem-vindo à fase operacional!",
          message: `Sua proposta foi aceita e o projeto "${project.name}" foi iniciado. Explore o portal para ver os próximos passos.`,
          ctaPath: `/portal/projects/${project.id}`,
        },
      })

      return project
    })

    revalidateCrmLeads()
    revalidateCrmLead(proposal.leadId)
    revalidateProjectData()

    return { success: true, projectId: result.id }
  } catch (error) {
    logger.error({ error, proposalId }, "Process Handoff Error")
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process project handoff",
    }
  }
}
