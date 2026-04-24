import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ProjectFinancialTab } from "@/src/components/admin/financial/ProjectFinancialTab"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getProjectInvoicesCached } from "@/src/lib/financial-data"
import prisma from "@/src/lib/prisma"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectFinancialPage({ params }: PageProps) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return null

  // Verify access
  const project = await prisma.project.findUnique({
    where: { id, clientId: user.id },
    select: { id: true },
  })

  if (!project) return notFound()

  const invoices = await getProjectInvoicesCached(id)

  return (
    <div className="flex flex-col gap-10">
      <ClientSectionHeader
        eyebrow="Gestão de Investimento"
        title="Financeiro e Pagamentos"
        description="Acompanhe o status das parcelas, faturas e envie seus comprovantes de pagamento."
      />

      <ProjectFinancialTab projectId={id} invoices={invoices} />
    </div>
  )
}
