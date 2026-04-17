"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProjectStatus } from "@/src/generated/client/enums"
import { DashboardProject } from "@/src/types/dashboard"
import {
  CheckCircle,
  CircleNotch,
  Clock,
  FileText,
  GithubLogo,
  Globe,
  HandsClapping,
  Monitor,
  NotePencil,
  Tag,
  WarningCircle,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  approveUpdateAction,
  rejectUpdateAction,
} from "@/src/lib/actions/project.actions"
import { cn, formatLocalTime } from "@/src/lib/utils/utils"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { ActionItemsWidget } from "./ActionItemsWidget"
import { AuditTrail } from "./AuditTrail"
import { NotificationsPanel } from "./NotificationsPanel"
import { VersionsLog } from "./VersionsLog"

interface DashboardSummaryProps {
  project: DashboardProject
}

export function DashboardSummary({ project }: DashboardSummaryProps) {
  const t = useTranslations("Dashboard")
  const tStatus = useTranslations("Dashboard.status")
  const tApp = useTranslations("Approvals")
  const [isApproving, setIsApproving] = React.useState<string | null>(null)
  const [isRejecting, setIsRejecting] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState("")

  const handleApprove = async (updateId: string) => {
    setIsApproving(updateId)
    const result = await approveUpdateAction(updateId, project.id)
    if (result.success) {
      toast.success("Aprovação registrada com sucesso.")
    } else {
      toast.error(result.error ?? "Erro ao aprovar")
    }
    setIsApproving(null)
  }

  const handleReject = async (updateId: string) => {
    setIsRejecting(updateId)
    const result = await rejectUpdateAction({
      updateId,
      projectId: project.id,
      feedback,
    })

    if (result.success) {
      toast.success("Feedback enviado para o time.")
      setFeedback("")
    } else {
      toast.error(result.error ?? "Erro ao reprovar")
    }

    setIsRejecting(null)
  }

  const statusSteps = [
    "STRATEGY",
    "ARCHITECTURE",
    "DESIGN",
    "ENGINEERING",
    "QA",
    "LAUNCHED",
  ]
  const currentStatusIndex = statusSteps.indexOf(project.status as string)

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-border/40 bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-2xl shadow-black/5 backdrop-blur-sm lg:p-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">
                {t("status.title")}
              </p>
              <h3 className="mt-3 font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                Projeto em ritmo de entrega
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">
                Fase atual:{" "}
                <span className="font-black uppercase text-brand-primary">
                  {project.status as string}
                </span>
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-brand-primary/20 bg-brand-primary/10 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
                progresso
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight text-foreground">
                {project.progress}%
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStatusIndex
              const isCurrent = index === currentStatusIndex

              return (
                <div
                  key={step}
                  className={cn(
                    "rounded-[1.5rem] border p-4 transition-all",
                    isCurrent
                      ? "border-brand-primary/35 bg-brand-primary/10 shadow-lg shadow-brand-primary/10"
                      : "border-border/20 bg-background/30",
                    isCompleted && "opacity-60"
                  )}
                >
                  <div className="mb-5 flex items-center justify-between">
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
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
                      0{index + 1}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-[0.22em]",
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

        <NotificationsPanel notifications={project.notifications || []} />
      </div>

      <ActionItemsWidget items={project.actionItems || []} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-border/40 bg-muted/10 p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Monitor weight="duotone" className="size-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Categoria
                    </span>
                    <p className="font-heading text-base font-black uppercase tracking-tight">
                      {project.category as string}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Tag weight="duotone" className="size-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Prioridade
                    </span>
                    <p className="font-heading text-base font-black uppercase tracking-tight">
                      {project.priority as string}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/40 bg-muted/10 p-8">
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Ambiente de produção
                  </span>
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-3 text-brand-primary transition-all hover:translate-x-1"
                    >
                      <Globe weight="duotone" className="size-5" />
                      <span className="truncate font-mono text-xs font-bold">
                        {project.liveUrl}
                      </span>
                    </a>
                  ) : (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/35">
                      Ainda indisponível
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Código-fonte
                  </span>
                  {project.repositoryUrl ? (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-3 text-brand-primary transition-all hover:translate-x-1"
                    >
                      <GithubLogo weight="duotone" className="size-5" />
                      <span className="truncate font-mono text-xs font-bold">
                        {project.repositoryUrl}
                      </span>
                    </a>
                  ) : (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/35">
                      Repositório privado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-border/40 bg-muted/10 p-8 backdrop-blur-sm">
            <div className="mb-8 flex flex-col gap-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("timeline.title")}
              </h3>
              <p className="text-sm text-muted-foreground/60">
                Linha viva de entregas, validações e decisões do projeto.
              </p>
            </div>

            <div className="ml-4 flex flex-col gap-0 border-l border-border/30">
              {project.updates.map((update, index) => (
                <div key={update.id} className="relative pb-12 pl-10 last:pb-0">
                  <div
                    className={cn(
                      "absolute -left-[9px] top-0 size-4 rounded-full border-2 border-background shadow-sm",
                      update.isMilestone
                        ? "bg-brand-primary scale-125"
                        : "bg-muted-foreground/40",
                      index === 0 && "ring-4 ring-brand-primary/20"
                    )}
                  />

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/35">
                        <Clock weight="bold" className="size-3" />
                        <span>
                          {formatLocalTime(
                            new Date(update.createdAt),
                            update.timezone
                          )}
                        </span>
                      </div>
                      {update.isMilestone && (
                        <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                          {t("timeline.milestone")}
                        </span>
                      )}
                    </div>

                    {update.requiresApproval &&
                    update.approvalStatus === "PENDING" ? (
                      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-primary/30 bg-[radial-gradient(circle_at_top_right,rgba(190,242,100,0.18),transparent_35%),linear-gradient(180deg,rgba(190,242,100,0.08),rgba(190,242,100,0.02))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                          <WarningCircle size={80} weight="fill" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-brand-primary animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                              {tApp("status.PENDING")}
                            </span>
                          </div>

                          <h4 className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
                            {update.title}
                          </h4>

                          {update.description && (
                            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground/80">
                              {update.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Button
                              onClick={() => handleApprove(update.id)}
                              disabled={isApproving === update.id}
                              className="rounded-full bg-brand-primary px-7 text-[10px] font-black uppercase tracking-[0.22em] shadow-xl shadow-brand-primary/20"
                            >
                              {isApproving === update.id ? (
                                <CircleNotch className="mr-2 size-4 animate-spin" />
                              ) : (
                                <HandsClapping
                                  className="mr-2 size-4"
                                  weight="fill"
                                />
                              )}
                              {tApp("actions.approve")}
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="rounded-full border-foreground/15 bg-background/80 px-7 text-[10px] font-black uppercase tracking-[0.22em]"
                                >
                                  <NotePencil className="mr-2 size-4" />
                                  Solicitar ajuste
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-xl rounded-[2rem] border-border/30 bg-background/95 p-8">
                                <DialogHeader>
                                  <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                                    Feedback da milestone
                                  </DialogTitle>
                                  <DialogDescription>
                                    Explique com clareza o que precisa ser
                                    ajustado para o time devolver a entrega na
                                    próxima rodada.
                                  </DialogDescription>
                                </DialogHeader>

                                <Textarea
                                  value={feedback}
                                  onChange={(event) =>
                                    setFeedback(event.target.value)
                                  }
                                  className="min-h-[180px] rounded-[1.5rem] border-border/40 bg-muted/10 p-5"
                                  placeholder="Ex: precisamos revisar hierarquia visual, CTA principal e clareza da proposta."
                                />

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    className="rounded-full"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(update.id)}
                                    disabled={isRejecting === update.id}
                                    className="rounded-full bg-brand-primary px-7 text-[10px] font-black uppercase tracking-[0.22em]"
                                  >
                                    {isRejecting === update.id ? (
                                      <CircleNotch className="mr-2 size-4 animate-spin" />
                                    ) : null}
                                    Enviar feedback
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "rounded-[1.5rem] border border-border/20 bg-background/30 p-5",
                          update.requiresApproval &&
                            update.approvalStatus === "APPROVED" &&
                            "border-green-500/25 bg-green-500/5",
                          update.requiresApproval &&
                            update.approvalStatus === "REJECTED" &&
                            "border-amber-500/25 bg-amber-500/5"
                        )}
                      >
                        <h4 className="flex flex-wrap items-center gap-3 font-heading text-lg font-black uppercase tracking-tight text-foreground">
                          {update.title}
                          {update.requiresApproval &&
                            update.approvalStatus === "APPROVED" && (
                              <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-green-500">
                                <CheckCircle weight="fill" size={12} />
                                {tApp("status.APPROVED", {
                                  date: update.approvedAt
                                    ? formatLocalTime(
                                        new Date(update.approvedAt),
                                        update.timezone
                                      )
                                    : "",
                                })}
                              </span>
                            )}
                          {update.requiresApproval &&
                            update.approvalStatus === "REJECTED" && (
                              <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500">
                                Ajustes solicitados
                              </span>
                            )}
                        </h4>

                        {update.description && (
                          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground/65">
                            {update.description}
                          </p>
                        )}

                        {update.feedback && (
                          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">
                              Feedback enviado
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                              {update.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <VersionsLog versions={project.versions || []} />
          <AuditTrail logs={project.auditLogs || []} />
        </div>

        <aside className="flex flex-col gap-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Repositório de ativos
          </h3>

          {project.assets.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border/40 bg-muted/10 p-12 text-center">
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
                  className="group flex items-center gap-4 rounded-[1.5rem] border border-border/35 bg-muted/10 p-5 transition-all hover:-translate-y-1 hover:border-brand-primary/20 hover:bg-brand-primary/5"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-transform group-hover:scale-110">
                    <FileText weight="duotone" className="size-6" />
                  </div>
                  <div className="flex min-w-0 flex-col overflow-hidden">
                    <span className="truncate text-xs font-black uppercase tracking-tight text-foreground">
                      {asset.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Visualizar documento
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
