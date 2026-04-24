import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import { ProjectCommunication } from "@/src/components/common/communication/ProjectCommunication"

import {
  getProjectDecisionsCached,
  getProjectThreadsCached,
} from "@/src/lib/communication-data"
import prisma from "@/src/lib/prisma"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectCommunicationPage({ params }: PageProps) {
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

  const [threads, decisions] = await Promise.all([
    getProjectThreadsCached(id),
    getProjectDecisionsCached(id),
  ])

  return (
    <div className="flex flex-col gap-10">
      <ClientSectionHeader
        eyebrow="Comunicação Central"
        title="Threads e Decisões"
        description="Acompanhe as conversas estruturadas e o histórico formal de decisões do projeto."
      />

      <ProjectCommunication
        projectId={id}
        initialThreads={threads}
        initialDecisions={decisions}
        currentUserId={user.id}
        userRole="CLIENT"
      />
    </div>
  )
}
