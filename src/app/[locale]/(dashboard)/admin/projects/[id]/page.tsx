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
      members: {
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        include: {
          attachments: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      assets: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
    },
    orderBy: [{ companyName: "asc" }, { name: "asc" }],
  })

  const dashboardProject = JSON.parse(JSON.stringify(project))

  return (
    <main className="relative flex flex-col gap-12 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <ProjectDetailsHeader project={project} />

      <ProjectTabs project={dashboardProject} projectId={id} clients={clients} />
    </main>
  )
}
