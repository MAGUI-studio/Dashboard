import * as React from "react"

import { getTranslations } from "next-intl/server"

import { auth } from "@clerk/nextjs/server"
import {
  CheckCircle,
  Clock,
  FileText,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr"

import { ProjectSwitcher } from "@/src/components/common/ProjectSwitcher"

import prisma from "@/src/lib/prisma"
import { cn } from "@/src/lib/utils/utils"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard")
  const { userId } = await auth()
  const { project: selectedProjectId } = await searchParams

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  const isAdmin = user?.role === "ADMIN"

  if (isAdmin) {
    const allProjects = await prisma.project.findMany({
      include: {
        client: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    const allUpdates = await prisma.update.findMany({
      include: {
        project: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return (
      <main className="relative flex min-h-svh flex-col bg-background/50 p-6 lg:p-12">
        <div className="flex flex-col gap-12 w-full">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                {t("admin_eyebrow")}
              </p>
            </div>
            <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
              {t("admin_title")}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {t("active_projects_count", { count: allProjects.length })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Global Timeline */}
            <section className="flex flex-col gap-8 lg:col-span-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                <Clock weight="bold" className="size-4" />
                {t("global_timeline_title")}
              </h3>

              <div className="flex flex-col gap-0 border-l border-border/40 ml-4">
                {allUpdates.map((update, index) => (
                  <div
                    key={update.id}
                    className="relative pl-10 pb-12 last:pb-0"
                  >
                    <div
                      className={cn(
                        "absolute -left-[9px] top-0 size-4 rounded-full border-2 border-background",
                        update.isMilestone
                          ? "bg-brand-primary scale-125"
                          : "bg-muted-foreground/40",
                        index === 0 && "ring-4 ring-brand-primary/20"
                      )}
                    />

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Sao_Paulo",
                          }).format(new Date(update.createdAt))}{" "}
                          BRT
                        </span>
                        <span className="rounded-lg bg-muted/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 border border-border/20">
                          {t("project_name_label")}: {update.project.name}
                        </span>
                        {update.isMilestone && (
                          <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                            {t("timeline.milestone")}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                        {update.title}
                      </h4>
                      {update.description && (
                        <p className="text-sm font-medium leading-relaxed text-muted-foreground/60">
                          {update.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Project Overview */}
            <aside className="flex flex-col gap-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                <TrendUp weight="bold" className="size-4" />
                Performance Recente
              </h3>

              <div className="flex flex-col gap-4">
                {allProjects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-border/40 bg-muted/5 p-5 backdrop-blur-sm"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">
                          {p.status}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/40">
                          {p.progress}%
                        </span>
                      </div>
                      <h4 className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                        {p.name}
                      </h4>
                      <div className="h-1 w-full rounded-full bg-muted/20">
                        <div
                          className="h-full rounded-full bg-brand-primary transition-all duration-500"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    )
  }

  // CLIENT DASHBOARD (rest of original logic with width fix)
  const userWithProjects = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      projects: {
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
          },
          assets: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  const projects = userWithProjects?.projects || []
  const project = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : projects[0]

  if (projects.length === 0) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading text-2xl font-black uppercase tracking-tight opacity-20">
          {t("no_project")}
        </h2>
      </main>
    )
  }

  const activeProject = project || projects[0]

  const statusSteps = [
    "STRATEGY",
    "ARCHITECTURE",
    "DESIGN",
    "ENGINEERING",
    "QA",
    "LAUNCHED",
  ]
  const currentStatusIndex = statusSteps.indexOf(activeProject.status)

  return (
    <main className="relative flex min-h-svh flex-col bg-background/50 p-6 lg:p-12">
      <div className="flex flex-col gap-12 w-full">
        {/* Header & Project Switcher */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                {t("eyebrow")}
              </p>
            </div>
            <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
              {activeProject.name}
            </h1>
          </div>

          {projects.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Selecione o Projeto
              </span>
              <ProjectSwitcher
                projects={projects}
                activeId={activeProject.id}
              />
            </div>
          )}
        </div>

        {/* Protocol Status Bar */}
        <section className="flex flex-col gap-8 rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("status.title")}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                {activeProject.progress}% {t("status.progress")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStatusIndex
              const isCurrent = index === currentStatusIndex

              return (
                <div
                  key={step}
                  className={cn(
                    "flex flex-col gap-3 p-4 rounded-2xl border transition-all",
                    isCurrent
                      ? "bg-brand-primary/10 border-brand-primary/40 shadow-lg shadow-brand-primary/5"
                      : "border-border/20 bg-muted/5",
                    isCompleted && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    {isCompleted ? (
                      <CheckCircle
                        weight="fill"
                        className="size-4 text-brand-primary"
                      />
                    ) : (
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          isCurrent
                            ? "bg-brand-primary animate-pulse"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      isCurrent
                        ? "text-brand-primary"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {t(`status.${step}`)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Execution Timeline */}
          <section className="flex flex-col gap-8 lg:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("timeline.title")}
            </h3>

            <div className="flex flex-col gap-0 border-l border-border/40 ml-4">
              {activeProject.updates.map((update, index) => (
                <div key={update.id} className="relative pl-10 pb-12 last:pb-0">
                  <div
                    className={cn(
                      "absolute -left-[9px] top-0 size-4 rounded-full border-2 border-background",
                      update.isMilestone
                        ? "bg-brand-primary scale-125"
                        : "bg-muted-foreground/40",
                      index === 0 && "ring-4 ring-brand-primary/20"
                    )}
                  />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                        {new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "America/Sao_Paulo",
                        }).format(new Date(update.createdAt))}{" "}
                        BRT
                      </span>
                      {update.isMilestone && (
                        <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                          {t("timeline.milestone")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                      {update.title}
                    </h4>
                    {update.description && (
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground/60">
                        {update.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Project Assets (Client View) */}
          <aside className="flex flex-col gap-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Documentos e Ativos
            </h3>

            <div className="flex flex-col gap-4">
              {activeProject.assets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/40 p-12 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                    Nenhum arquivo disponível para este projeto.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeProject.assets.map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/5 p-4 transition-all hover:bg-brand-primary/5 hover:border-brand-primary/20"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                        <FileText weight="duotone" className="size-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-[11px] font-bold uppercase tracking-tight text-foreground">
                          {asset.name}
                        </span>
                        <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                          {asset.type}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
