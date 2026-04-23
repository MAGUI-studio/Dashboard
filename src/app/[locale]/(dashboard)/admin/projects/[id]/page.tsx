import * as React from "react"

import { notFound, redirect } from "next/navigation"

import { DashboardAuditLog, DashboardProject } from "@/src/types/dashboard"

import { ProjectDetailsHeader } from "@/src/components/admin/ProjectDetailsHeader"
import { ProjectTabs } from "@/src/components/admin/ProjectTabs"

import { getAdminClientOptions } from "@/src/lib/client-data"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  getAdminProjectAssets,
  getAdminProjectAudit,
  getAdminProjectOverview,
  getAdminProjectTimeline,
} from "@/src/lib/project-data"
import { dashboardMetadata } from "@/src/lib/seo"

interface ProjectPageProps {
  params: Promise<{ id: string; locale: string }>
}

type AdminProjectOverviewResult = NonNullable<
  Awaited<ReturnType<typeof getAdminProjectOverview>>
>
type AdminProjectTimelineResult = Awaited<
  ReturnType<typeof getAdminProjectTimeline>
>
type AdminProjectAssetsResult = Awaited<
  ReturnType<typeof getAdminProjectAssets>
>
type AdminProjectAuditResult = Awaited<ReturnType<typeof getAdminProjectAudit>>

function toDashboardProject(input: {
  project: AdminProjectOverviewResult
  updates: AdminProjectTimelineResult
  assets: AdminProjectAssetsResult
  auditLogs: AdminProjectAuditResult
}): DashboardProject {
  const { project, updates, assets, auditLogs } = input

  return {
    ...project,
    client: {
      ...project.client,
      phone: null,
      position: null,
      taxId: null,
    },
    briefing:
      (project.briefing as DashboardProject["briefing"] | null | undefined) ??
      null,
    updates: updates.map((update: AdminProjectTimelineResult[number]) => ({
      ...update,
      project: { name: project.name },
    })),
    assets: assets?.assets ?? [],
    auditLogs: auditLogs.map((log) => ({
      ...log,
      metadata:
        log.metadata &&
        typeof log.metadata === "object" &&
        !Array.isArray(log.metadata)
          ? (log.metadata as DashboardAuditLog["metadata"])
          : null,
    })),
  }
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  return dashboardMetadata({
    title: project ? `Projeto admin: ${project.name}` : "Projeto admin",
    description:
      "Detalhes administrativos, membros, atividades e atualizacoes do projeto.",
    path: `/admin/projects/${id}`,
  })
}

export default async function AdminProjectDetailPage({
  params,
}: ProjectPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params

  const [project, updates, assets, auditLogs, clients] = await Promise.all([
    getAdminProjectOverview(id),
    getAdminProjectTimeline(id),
    getAdminProjectAssets(id),
    getAdminProjectAudit(id),
    getAdminClientOptions(),
  ])

  if (!project) {
    notFound()
  }

  const dashboardProject = toDashboardProject({
    project,
    updates,
    assets,
    auditLogs,
  })

  const projectHeader = {
    id: project.id,
    name: project.name,
    budget: project.budget,
    deadline: project.deadline,
    client: {
      id: project.client.id,
      name: project.client.name,
      email: project.client.email,
    },
  }

  return (
    <main className="relative flex flex-col gap-12 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <ProjectDetailsHeader project={projectHeader} />

      <ProjectTabs
        project={dashboardProject}
        projectId={id}
        clients={clients}
      />
    </main>
  )
}
