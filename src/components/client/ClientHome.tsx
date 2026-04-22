import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { ClientHomeData } from "@/src/types/client-portal"
import {
  ClockCountdown,
  Files,
  FolderOpen,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { toHref } from "@/src/lib/utils/navigation"

import { ClientHeroStatus } from "./ClientHeroStatus"
import { ClientNextActionCard } from "./ClientNextActionCard"
import { ClientProjectCard } from "./ClientProjectCard"
import { ClientRecentActivityStrip } from "./ClientRecentActivityStrip"

interface ClientHomeProps {
  userName: string
  data: ClientHomeData
  isBriefingEmpty: boolean
}

export async function ClientHome({
  userName,
  data,
  isBriefingEmpty,
}: ClientHomeProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home")

  const activeProject = data.projects[0]

  let nextAction: React.ComponentProps<typeof ClientNextActionCard>["action"] =
    {
      type: "default",
      title: t("cta.type.default"),
      description: t("cta.description.default"),
      href: toHref(
        activeProject ? `/projects/${activeProject.id}` : "/projects"
      ),
    }

  if (isBriefingEmpty && activeProject) {
    nextAction = {
      type: "briefing",
      title: t("cta.type.briefing"),
      description: t("cta.description.briefing"),
      href: toHref(`/projects/${activeProject.id}/briefing`),
      projectName: activeProject.name,
    }
  } else if (data.pendingApprovals.length > 0) {
    const approval = data.pendingApprovals[0]
    nextAction = {
      type: "approval",
      title: approval.title,
      description: t("cta.description.approval"),
      href: toHref(`/projects/${approval.projectId}/approvals`),
      projectName: approval.project.name,
    }
  } else if (data.pendingTasks.length > 0) {
    const task = data.pendingTasks[0]
    nextAction = {
      type: "task",
      title: task.title,
      description: t("cta.description.task"),
      href: toHref(`/projects/${task.projectId}/tasks`),
      projectName: task.project.name,
    }
  }

  const heroStatus: React.ComponentProps<typeof ClientHeroStatus>["status"] =
    isBriefingEmpty
      ? "briefing_incomplete"
      : data.pendingApprovals.length > 0
        ? "awaiting_approval"
        : data.pendingTasks.length > 0
          ? "need_shipment"
          : "on_track"

  return (
    <div className="flex w-full flex-col gap-10 lg:gap-14">
      <header className="flex flex-col justify-between gap-8 border-b border-border/20 pb-10 md:flex-row md:items-end">
        <ClientHeroStatus userName={userName} status={heroStatus} />

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full px-6 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Link href="/projects">
              <FolderOpen className="mr-2 size-4" weight="duotone" />
              {t("nav.projects")}
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-10 lg:gap-14">
        <ClientNextActionCard action={nextAction} />

        {activeProject && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-heading text-2xl font-black uppercase tracking-tight">
                {t("active_project_title")}
              </h2>
            </div>
            <ClientProjectCard
              project={{
                ...activeProject,
                lastUpdate: activeProject.updates?.[0],
              }}
            />
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <ClientRecentActivityStrip activities={data.recentActivity} />

          <div className="flex flex-col gap-8">
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight px-2">
              {t("quick_links_title")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: t("links.files"),
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/files`
                      : "/projects"
                  ),
                  icon: Files,
                },
                {
                  label: t("links.briefing"),
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/briefing`
                      : "/projects"
                  ),
                  icon: NotePencil,
                },
                {
                  label: t("links.timeline"),
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/timeline`
                      : "/projects"
                  ),
                  icon: FolderOpen,
                },
                {
                  label: t("links.tasks"),
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/tasks`
                      : "/projects"
                  ),
                  icon: ClockCountdown,
                },
              ].map((link) => (
                <Button
                  key={link.label}
                  asChild
                  variant="ghost"
                  className="flex h-24 flex-col items-center justify-center gap-3 rounded-[2rem] border border-border/30 bg-muted/5 transition-all hover:bg-muted/10 active:scale-95"
                >
                  <Link href={link.href}>
                    <link.icon
                      className="size-6 text-brand-primary/60"
                      weight="duotone"
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {link.label}
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
