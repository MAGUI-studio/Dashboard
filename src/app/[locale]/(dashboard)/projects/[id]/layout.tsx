import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientProjectBreadcrumb } from "@/src/components/client/ClientProjectBreadcrumb"
import { ClientAiWidget } from "@/src/components/client/ai/ClientAiWidget"

import { getClientProjectBreadcrumb } from "@/src/lib/client-projects"
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

  const project = await getClientProjectBreadcrumb(id, user.id)

  if (!project) return notFound()

  return (
    <div className="flex min-h-full flex-col px-5 py-10 sm:px-6 lg:px-12 relative">
      <main className="mx-auto flex w-full max-w-440 flex-col">
        <ClientProjectBreadcrumb
          projectId={project.id}
          projectName={project.name}
        />
        {children}
      </main>

      <ClientAiWidget
        projectId={project.id}
        contactName={user.name || "Cliente"}
      />
    </div>
  )
}
