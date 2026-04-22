import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientApprovalHistory } from "@/src/components/client/ClientApprovalHistory"
import { ClientApprovalList } from "@/src/components/client/ClientApprovalList"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Aprovacoes do projeto",
  description: "Aprovacoes autenticadas, historico e pendencias do projeto.",
  path: "/projects",
})

export default async function ApprovalsPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectById(id, user.id)

  if (!project) return notFound()

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / Entregas`}
        title="Entregas para validar"
        description="Aprove o que estiver certo ou peca ajustes com clareza. Sua resposta move a proxima etapa."
      />

      <div className="grid gap-10">
        <ClientApprovalList updates={project.updates} projectId={id} />
        <ClientApprovalHistory updates={project.updates} />
      </div>
    </div>
  )
}
