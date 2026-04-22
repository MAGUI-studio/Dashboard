import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import { ClientTimeline } from "@/src/components/client/ClientTimeline"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Timeline do projeto",
  description: "Historico autenticado de atualizacoes e marcos do projeto.",
  path: "/projects",
})

export default async function TimelinePage({
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
        eyebrow={`${project.name} / Historico`}
        title="Historico do projeto"
        description="Acompanhe a evolucao como uma linha narrativa: marcos, entregas, feedbacks e proximos passos."
      />

      <ClientTimeline updates={project.updates} />
    </div>
  )
}
