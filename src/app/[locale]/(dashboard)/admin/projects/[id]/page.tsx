import * as React from "react"

import { notFound, redirect } from "next/navigation"

import { ProjectDetailsHeader } from "@/src/components/admin/ProjectDetailsHeader"
import { ProjectTabs } from "@/src/components/admin/ProjectTabs"

import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

interface ProjectPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function AdminProjectDetailPage({
  params,
}: ProjectPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      updates: {
        orderBy: { createdAt: "desc" },
        include: { project: true },
      },
      assets: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const dashboardProject = JSON.parse(JSON.stringify(project))

  return (
    <main className="relative flex min-h-svh flex-col gap-12 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <ProjectDetailsHeader project={project} />

      <ProjectTabs project={dashboardProject} projectId={id} />
    </main>
  )
}
