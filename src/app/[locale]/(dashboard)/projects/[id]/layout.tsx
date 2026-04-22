import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientProjectSidebar } from "@/src/components/client/ClientProjectSidebar"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  return dashboardMetadata({
    title: project?.name ?? "Projeto",
    description:
      "Area autenticada do projeto com timeline, aprovacoes, arquivos, briefing e tarefas.",
    path: `/projects/${id}`,
  })
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
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
    <div className="flex min-h-full flex-col bg-background">
      <ClientProjectSidebar projectId={id} />
      <div className="mx-auto flex w-full max-w-440 flex-col px-6 py-10 lg:px-12 lg:py-14">
        {children}
      </div>
    </div>
  )
}
