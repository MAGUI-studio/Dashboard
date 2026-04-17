import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { DashboardProject } from "@/src/types/dashboard"
import {
  Clock,
  Files,
  Info,
  Sliders,
  Terminal,
} from "@phosphor-icons/react/dist/ssr"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import { ProjectAssetsTab } from "@/src/components/admin/ProjectAssetsTab"
import { ProjectDetailsHeader } from "@/src/components/admin/ProjectDetailsHeader"
import { ProjectEngineeringTab } from "@/src/components/admin/ProjectEngineeringTab"
import { ProjectOverviewTab } from "@/src/components/admin/ProjectOverviewTab"
import { ProjectSettingsTab } from "@/src/components/admin/ProjectSettingsTab"
import { ProjectTimelineTab } from "@/src/components/admin/ProjectTimelineTab"

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
  const t = await getTranslations("Admin.projects.details")

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

  // Cast to DashboardProject for consistency
  const dashboardProject = project as unknown as DashboardProject

  return (
    <main className="relative flex min-h-svh flex-col gap-12 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <ProjectDetailsHeader project={project} />

      <Tabs defaultValue="overview" className="w-full">
        <div className="mb-10 flex items-center justify-between border-b border-border/40 pb-4">
          <TabsList variant="line" className="bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Info weight="duotone" className="mr-2 size-4" />
              {t("tabs.overview", { fallback: "Visão Geral" })}
            </TabsTrigger>
            <TabsTrigger
              value="engineering"
              className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Terminal weight="duotone" className="mr-2 size-4" />
              {t("tabs.engineering", { fallback: "Status" })}
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Clock weight="duotone" className="mr-2 size-4" />
              {t("tabs.timeline", { fallback: "Timeline" })}
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Files weight="duotone" className="mr-2 size-4" />
              {t("tabs.assets", { fallback: "Ativos" })}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Sliders weight="duotone" className="mr-2 size-4" />
              {t("tabs.settings", { fallback: "Configurações" })}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <ProjectOverviewTab project={dashboardProject} />
        </TabsContent>

        <TabsContent value="engineering" className="mt-0">
          <ProjectEngineeringTab project={project} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <ProjectTimelineTab
            projectId={project.id}
            updates={project.updates}
          />
        </TabsContent>

        <TabsContent value="assets" className="mt-0">
          <ProjectAssetsTab projectId={project.id} assets={project.assets} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <ProjectSettingsTab
            projectId={project.id}
            projectName={project.name}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
