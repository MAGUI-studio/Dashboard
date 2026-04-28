import * as React from "react"

import { notFound, redirect } from "next/navigation"

import { DashboardAuditLog, DashboardProject } from "@/src/types/dashboard"

import { ProjectDetailsHeader } from "@/src/components/admin/ProjectDetailsHeader"
import { ProjectTabs } from "@/src/components/admin/ProjectTabs"

import { getAdminClientOptions } from "@/src/lib/client-data"
import {
  getProjectDecisionsCached,
  getProjectThreadsCached,
} from "@/src/lib/communication-data"
import { getProjectInvoices } from "@/src/lib/financial-data"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  getAdminProjectOverview,
  getAdminProjectTimeline,
} from "@/src/lib/project-data"
import { getCurrentAppUser } from "@/src/lib/project-governance"
import { dashboardMetadata } from "@/src/lib/seo"

interface ProjectPageProps {
  params: Promise<{ id: string; locale: string }>
}

function toDashboardProject(input: {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  project: any
  timeline: any
  /* eslint-enable @typescript-eslint/no-explicit-any */
}): DashboardProject {
  const { project, timeline } = input

  return {
    ...project,
    client: {
      ...project.client,
      companyName: project.client.companyName ?? null,
      phone: null,
      position: null,
      taxId: null,
    },
    briefing:
      (project.briefing as DashboardProject["briefing"] | null | undefined) ??
      null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates: (timeline?.updates || []).map((update: any) => ({
      ...update,
      project: { name: project.name },
    })),
    assets: [],
    auditLogs: [],
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

  const [
    project,
    timeline,
    clients,
    threads,
    decisions,
    currentUser,
    invoices,
  ] = await Promise.all([
    getAdminProjectOverview(id),
    getAdminProjectTimeline(id),
    getAdminClientOptions(),
    getProjectThreadsCached(id),
    getProjectDecisionsCached(id),
    getCurrentAppUser(),
    getProjectInvoices(id),
  ])

  if (!project) {
    notFound()
  }

  const dashboardProject = toDashboardProject({
    project,
    timeline,
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
        threads={threads}
        decisions={decisions}
        currentUserId={currentUser?.id || ""}
        invoices={invoices}
      />
    </main>
  )
}
