import * as React from "react"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { ContractSentEmail } from "@/src/components/email/ContractSentEmail"
import { InvoiceSentEmail } from "@/src/components/email/InvoiceSentEmail"
import { ProposalSentEmail } from "@/src/components/email/ProposalSentEmail"

import prisma from "@/src/lib/prisma"

import { env } from "@/src/config/env"

import { sendTransactionalEmail } from "./index"

export type ProductEvent =
  | { type: "PROPOSAL_SENT"; proposalId: string }
  | { type: "CONTRACT_SENT"; documentId: string }
  | { type: "INVOICE_SENT"; invoiceId: string }
  | { type: "UPDATE_PUBLISHED"; updateId: string; projectId: string }

export async function triggerProductEvent(event: ProductEvent) {
  try {
    switch (event.type) {
      case "PROPOSAL_SENT": {
        const proposal = await prisma.proposal.findUnique({
          where: { id: event.proposalId },
          include: { lead: true },
        })

        if (!proposal?.lead.email) return

        await sendTransactionalEmail({
          to: proposal.lead.email,
          subject: `Nova Proposta Comercial: ${proposal.title}`,
          template: React.createElement(ProposalSentEmail, {
            contactName: proposal.lead.contactName || proposal.lead.companyName,
            proposalTitle: proposal.title,
            proposalUrl: `${env.NEXT_PUBLIC_SITE_URL}/proposals/${proposal.id}`,
            totalValue: `${proposal.currency} ${proposal.totalValue.toLocaleString("pt-BR")}`,
          }),
          templateKey: "PROPOSAL_SENT",
          entityType: "Proposal",
          entityId: proposal.id,
        })
        break
      }

      case "CONTRACT_SENT": {
        const doc = await prisma.document.findUnique({
          where: { id: event.documentId },
          include: { client: true },
        })

        if (!doc?.client?.email) return

        await sendTransactionalEmail({
          to: doc.client.email,
          subject: `Documento para Assinatura: ${doc.title}`,
          template: React.createElement(ContractSentEmail, {
            contactName: doc.client.name || "Cliente",
            contractTitle: doc.title,
            contractUrl: `${env.NEXT_PUBLIC_SITE_URL}/portal/documents/${doc.id}`,
          }),
          templateKey: "CONTRACT_SENT",
          entityType: "Document",
          entityId: doc.id,
        })
        break
      }

      case "INVOICE_SENT": {
        const invoice = await prisma.invoice.findUnique({
          where: { id: event.invoiceId },
          include: { project: { include: { client: true } } },
        })

        if (!invoice?.project?.client.email) return

        await sendTransactionalEmail({
          to: invoice.project.client.email,
          subject: `Fatura Emitida: ${invoice.title}`,
          template: React.createElement(InvoiceSentEmail, {
            contactName: invoice.project.client.name || "Cliente",
            invoiceTitle: invoice.title,
            invoiceUrl: `${env.NEXT_PUBLIC_SITE_URL}/portal/projects/${invoice.projectId}/financial`,
            dueDate: invoice.dueDate
              ? format(new Date(invoice.dueDate), "dd/MM/yyyy", {
                  locale: ptBR,
                })
              : "N/D",
            totalAmount: `${invoice.currency} ${invoice.totalAmount.toLocaleString("pt-BR")}`,
          }),
          templateKey: "INVOICE_SENT",
          entityType: "Invoice",
          entityId: invoice.id,
        })
        break
      }
    }
  } catch (error) {
    console.error("Error triggering product event email:", error)
  }
}
