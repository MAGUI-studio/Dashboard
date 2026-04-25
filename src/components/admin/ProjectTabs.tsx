"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Prisma } from "@/src/generated/client"
import { DashboardProject } from "@/src/types/dashboard"
import {
  ChatCircleDots,
  Clock,
  CurrencyCircleDollar,
  Files,
  Fingerprint,
  Handshake,
  Info,
  NoteBlank,
  Sliders,
  Terminal,
} from "@phosphor-icons/react"
import { parseAsString, useQueryState } from "nuqs"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import { ProjectAssetsTab } from "@/src/components/admin/ProjectAssetsTab"
import { ProjectAuditTab } from "@/src/components/admin/ProjectAuditTab"
import { ProjectBriefingTab } from "@/src/components/admin/ProjectBriefingTab"
import { ProjectEngineeringTab } from "@/src/components/admin/ProjectEngineeringTab"
import { ProjectOverviewTab } from "@/src/components/admin/ProjectOverviewTab"
import { ProjectSettingsTab } from "@/src/components/admin/ProjectSettingsTab"
import { ProjectTimelineTab } from "@/src/components/admin/ProjectTimelineTab"
import { ProjectFinancialTab } from "@/src/components/admin/financial/ProjectFinancialTab"
import { ProjectHandoffTab } from "@/src/components/admin/handoff/ProjectHandoffTab"
import { ProjectCommunication } from "@/src/components/common/communication/ProjectCommunication"

interface ProjectTabsProps {
  project: DashboardProject
  projectId: string
  clients: Array<{
    id: string
    name: string | null
    email: string
    companyName: string | null
  }>
  threads: Array<
    Prisma.ThreadGetPayload<{
      include: {
        messages: {
          include: {
            author: true
            resolvedBy: true
          }
        }
      }
    }> &
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
  >
  decisions: Array<
    Prisma.DecisionGetPayload<{
      include: {
        decidedBy: true
      }
    }> &
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
  >
  currentUserId: string
  handoff?: Prisma.ProjectHandoffGetPayload<{
    include: {
      proposal: {
        include: {
          items: true
        }
      }
    }
  }> | null
  kickoff?: Prisma.ProjectKickoffChecklistGetPayload<
    Record<string, never>
  > | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoices: any[]
}

export function ProjectTabs({
  project,
  projectId,
  clients,
  threads,
  decisions,
  currentUserId,
  handoff,
  kickoff,
  invoices,
}: ProjectTabsProps) {
  const t = useTranslations("Admin.projects.details")
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("overview")
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="mb-10 flex items-center justify-between border-b border-border/40 pb-4 overflow-x-auto scrollbar-hide">
        <TabsList variant="line" className="bg-transparent p-0 flex-nowrap">
          <TabsTrigger
            value="overview"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Info weight="duotone" className="mr-2 size-4" />
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger
            value="engineering"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Terminal weight="duotone" className="mr-2 size-4" />
            {t("tabs.engineering")}
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Clock weight="duotone" className="mr-2 size-4" />
            {t("tabs.timeline")}
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <ChatCircleDots weight="duotone" className="mr-2 size-4" />
            {t("tabs.communication", { fallback: "Comunicação" })}
          </TabsTrigger>
          <TabsTrigger
            value="handoff"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Handshake weight="duotone" className="mr-2 size-4" />
            {t("tabs.handoff", { fallback: "Handoff" })}
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <CurrencyCircleDollar weight="duotone" className="mr-2 size-4" />
            {t("tabs.financial", { fallback: "Financeiro" })}
          </TabsTrigger>
          <TabsTrigger
            value="briefing"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <NoteBlank weight="duotone" className="mr-2 size-4" />
            {t("tabs.briefing", { fallback: "Briefing" })}
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Files weight="duotone" className="mr-2 size-4" />
            {t("tabs.assets")}
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Fingerprint weight="duotone" className="mr-2 size-4" />
            {t("tabs.audit", { fallback: "Auditoria" })}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent whitespace-nowrap"
          >
            <Sliders weight="duotone" className="mr-2 size-4" />
            {t("tabs.settings")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
        <ProjectOverviewTab project={project} />
      </TabsContent>

      <TabsContent
        value="engineering"
        className="mt-0 focus-visible:outline-none"
      >
        <ProjectEngineeringTab project={project} />
      </TabsContent>

      <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
        <ProjectTimelineTab projectId={projectId} updates={project.updates} />
      </TabsContent>

      <TabsContent
        value="communication"
        className="mt-0 focus-visible:outline-none"
      >
        <ProjectCommunication
          projectId={projectId}
          initialThreads={threads}
          initialDecisions={decisions}
          currentUserId={currentUserId}
          userRole="ADMIN"
        />
      </TabsContent>

      <TabsContent value="handoff" className="mt-0 focus-visible:outline-none">
        <ProjectHandoffTab
          handoff={handoff ?? null}
          kickoff={kickoff ?? null}
        />
      </TabsContent>

      <TabsContent
        value="financial"
        className="mt-0 focus-visible:outline-none"
      >
        <ProjectFinancialTab invoices={invoices} />
      </TabsContent>

      <TabsContent value="briefing" className="mt-0 focus-visible:outline-none">
        <ProjectBriefingTab briefing={project.briefing} />
      </TabsContent>

      <TabsContent value="assets" className="mt-0 focus-visible:outline-none">
        <ProjectAssetsTab projectId={projectId} assets={project.assets} />
      </TabsContent>

      <TabsContent value="audit" className="mt-0 focus-visible:outline-none">
        <ProjectAuditTab logs={project.auditLogs || []} projectId={projectId} />
      </TabsContent>

      <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
        <ProjectSettingsTab
          projectId={projectId}
          members={project.members || []}
          clients={clients}
        />
      </TabsContent>
    </Tabs>
  )
}
