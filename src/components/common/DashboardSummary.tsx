"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProjectStatus } from "@/src/generated/client"
import {
  CheckCircle,
  Clock,
  FileText,
  GithubLogo,
  Globe,
  Monitor,
  Tag,
} from "@phosphor-icons/react"

import { cn, formatLocalTime } from "@/src/lib/utils/utils"

interface DashboardSummaryProps {
  project: {
    name: string
    status: string
    progress: number
    category: string
    priority: string
    liveUrl: string | null
    repositoryUrl: string | null
    updates: Array<{
      id: string
      title: string
      description: string | null
      createdAt: Date | string
      timezone: string
      isMilestone: boolean
      project: { name: string }
    }>
    assets: Array<{
      id: string
      name: string
      url: string
    }>
  }
}

export function DashboardSummary({ project }: DashboardSummaryProps) {
  const t = useTranslations("Dashboard")
  const tStatus = useTranslations("Dashboard.status")

  const statusSteps = [
    "STRATEGY",
    "ARCHITECTURE",
    "DESIGN",
    "ENGINEERING",
    "QA",
    "LAUNCHED",
  ]
  const currentStatusIndex = statusSteps.indexOf(project.status)

  return (
    <div className="flex flex-col gap-12 w-full">
      {/* Protocol Status Bar */}
      <section className="flex flex-col gap-8 rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm lg:p-12">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("status.title")}
            </h3>
            <p className="text-xs font-medium text-muted-foreground/40">
              Fase atual:{" "}
              <span className="text-brand-primary font-bold uppercase">
                {project.status}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
              {project.progress}% {t("status.progress")}
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
                  {tStatus(step as ProjectStatus)}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-12">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border/40 bg-muted/5 p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Monitor weight="duotone" className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Categoria
                  </span>
                  <span className="font-heading text-base font-black uppercase tracking-tight text-foreground">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Tag weight="duotone" className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Prioridade
                  </span>
                  <span className="font-heading text-base font-black uppercase tracking-tight text-foreground">
                    {project.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/40 bg-muted/5 p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Ambiente de Produção
                </span>
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-brand-primary hover:underline transition-all"
                  >
                    <Globe weight="duotone" className="size-5" />
                    <span className="font-mono text-xs font-bold truncate max-w-[150px]">
                      {project.liveUrl}
                    </span>
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground/30 italic">
                    Não disponível ainda
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Código Fonte
                </span>
                {project.repositoryUrl ? (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-brand-primary hover:underline transition-all"
                  >
                    <GithubLogo weight="duotone" className="size-5" />
                    <span className="font-mono text-xs font-bold truncate max-w-[150px]">
                      {project.repositoryUrl}
                    </span>
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground/30 italic">
                    Privado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Execution Timeline */}
          <section className="flex flex-col gap-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("timeline.title")}
            </h3>

            <div className="flex flex-col gap-0 border-l border-border/40 ml-4">
              {project.updates.map((update, index) => (
                <div key={update.id} className="relative pl-10 pb-12 last:pb-0">
                  <div
                    className={cn(
                      "absolute -left-[9px] top-0 size-4 rounded-full border-2 border-background shadow-sm",
                      update.isMilestone
                        ? "bg-brand-primary scale-125"
                        : "bg-muted-foreground/40",
                      index === 0 && "ring-4 ring-brand-primary/20"
                    )}
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                        <Clock weight="bold" className="size-3" />
                        <span>
                          {formatLocalTime(
                            new Date(update.createdAt),
                            update.timezone
                          )}
                        </span>
                      </div>
                      {update.isMilestone && (
                        <span className="rounded-full bg-brand-primary/10 px-3 py-0.5 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                          {t("timeline.milestone")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                      {update.title}
                    </h4>
                    {update.description && (
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground/60 max-w-xl">
                        {update.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Project Assets (Client View) */}
        <aside className="flex flex-col gap-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Repositório de Ativos
          </h3>

          <div className="flex flex-col gap-4">
            {project.assets.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/40 p-12 text-center bg-muted/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                  Aguardando envio de arquivos.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {project.assets.map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-[1.25rem] border border-border/40 bg-muted/5 p-5 transition-all hover:bg-brand-primary/5 hover:border-brand-primary/20"
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                      <FileText weight="duotone" className="size-6" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-black text-foreground uppercase tracking-tight">
                        {asset.name}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        Visualizar Documento
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
  )
}
