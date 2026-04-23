import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import { ClientTaskList } from "@/src/components/client/ClientTaskList"

import { getClientProjectTasks } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Tarefas do projeto",
  description: "Solicitacoes e proximas acoes autenticadas do projeto.",
  path: "/projects",
})

export default async function TasksPage({
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

  const project = await getClientProjectTasks(id, user.id)

  if (!project) return notFound()

  const clientTasks = project.actionItems ?? []

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / Solicitacoes`}
        title="O que precisamos de voce"
        description="Pendencias, respostas e envios que ajudam o time a seguir sem travar o projeto."
      />

      <ClientTaskList tasks={clientTasks} />
    </div>
  )
}
