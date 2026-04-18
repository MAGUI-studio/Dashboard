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
import { UpdateAttachmentsList } from "./UpdateAttachmentsList"
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
      toast.success(tApp("toast.approve_success"))
    } else {
      toast.error(result.error ?? tApp("toast.error_approve"))
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
      toast.success(tApp("toast.reject_success"))
      setFeedback("")
    } else {
      toast.error(result.error ?? tApp("toast.error_reject"))
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
    <div className="flex w-full flex-col gap-16 pb-20">
      {/* 1. Primary Status & Core Actions */}
      <div className="grid gap-10 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-10">
          <section className="relative overflow-hidden rounded-4xl border border-border/40 bg-background/20 p-8 md:p-12 shadow-2xl shadow-black/5 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-brand-primary">
                    {t("status.title")}
                  </p>
                </div>
                <h3 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
                  {tStatus(project.status as ProjectStatus)}
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      {t("progress_label")}
                    </span>
                    <span className="text-xl font-black text-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-8 w-[1px] bg-border/30" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      {t("category_label")}
                    </span>
                    <span className="text-sm font-black uppercase tracking-tight text-foreground/80">
                      {project.category as string}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-14 items-center gap-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-6 transition-all hover:bg-brand-primary/10 hover:scale-[1.02]"
                  >
                    <Globe
                      weight="duotone"
                      className="size-6 text-brand-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary/60">
                        {t("production_environment")}
                      </span>
                      <span className="truncate font-mono text-xs font-bold text-foreground">
                        Acessar Sistema
                      </span>
                    </div>
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-14 items-center gap-4 rounded-2xl border border-border/40 bg-muted/5 px-6 transition-all hover:bg-muted/10 hover:scale-[1.02]"
                  >
                    <GithubLogo
                      weight="duotone"
                      className="size-6 text-muted-foreground/60"
                    />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {t("source_code")}
                      </span>
                      <span className="truncate font-mono text-xs font-bold text-foreground/80">
                        Ver Repositório
                      </span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Minimalist Status Bar */}
            <div className="relative">
              <div className="absolute left-0 top-1/2 h-[1px] w-full -translate-y-1/2 bg-border/20" />
              <div className="relative flex justify-between gap-2">
                {statusSteps.map((step, index) => {
                  const isCompleted = index < currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-3 relative"
                    >
                      <div
                        className={cn(
                          "z-10 flex size-4 items-center justify-center rounded-full border-2 border-background transition-all duration-500",
                          isCurrent
                            ? "bg-brand-primary scale-125 ring-4 ring-brand-primary/10"
                            : isCompleted
                              ? "bg-brand-primary"
                              : "bg-muted-foreground/20"
                        )}
                      />
                      <span
                        className={cn(
                          "absolute top-8 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-all",
                          isCurrent
                            ? "text-foreground opacity-100"
                            : "text-muted-foreground/40 opacity-50"
                        )}
                      >
                        {tStatus(step as ProjectStatus)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <ActionItemsWidget items={project.actionItems || []} />
        </div>

        <NotificationsPanel notifications={project.notifications || []} />
      </div>

      {/* 2. Timeline and Assets Grid */}
      <div className="grid gap-16 xl:grid-cols-[1fr_350px]">
        <div className="space-y-16">
          {/* Custom Modern Timeline */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-border/40" />
              <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
                {t("timeline.title")}
              </h3>
            </div>

            <div className="space-y-12">
              {project.updates.map((update, index) => (
                <div
                  key={update.id}
                  className="group relative grid gap-8 md:grid-cols-[180px_1fr]"
                >
                  <div className="flex flex-col md:items-end">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      {formatLocalTime(
                        new Date(update.createdAt),
                        update.timezone
                      )}
                    </span>
                    {update.isMilestone && (
                      <span className="mt-2 inline-flex rounded-full bg-brand-primary/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-brand-primary">
                        Marco Alcançado
                      </span>
                    )}
                  </div>

                  <div className="relative pl-8 md:pl-0">
                    <div className="absolute left-0 md:-left-10 top-0 bottom-0 w-[1px] bg-border/30 group-last:bg-transparent" />
                    <div className="absolute left-[-4px] md:-left-[44px] top-1 size-2 rounded-full border border-background bg-border/40 ring-4 ring-background" />

                    {update.requiresApproval &&
                    update.approvalStatus === "PENDING" ? (
                      <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/5 p-8 shadow-xl shadow-brand-primary/5">
                        <div className="flex items-center gap-2 mb-4">
                          <WarningCircle
                            size={18}
                            weight="fill"
                            className="text-brand-primary animate-pulse"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                            {tApp("status.PENDING")}
                          </span>
                        </div>
                        <h4 className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
                          {update.title}
                        </h4>
                        {update.description && (
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80 max-w-2xl font-medium">
                            {update.description}
                          </p>
                        )}
                        <div className="mt-6">
                          <UpdateAttachmentsList
                            attachments={update.attachments}
                            compact
                          />
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                          <Button
                            onClick={() => handleApprove(update.id)}
                            disabled={isApproving === update.id}
                            className="h-11 rounded-none bg-brand-primary px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-brand-primary/20"
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
                                className="h-11 rounded-none border-foreground/15 bg-background/80 px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em]"
                              >
                                <NotePencil className="mr-2 size-4" />
                                {tApp("actions.reject")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl rounded-none border-border/30 bg-background/95 p-12 backdrop-blur-2xl">
                              <DialogHeader>
                                <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight">
                                  {tApp("dialog.title")}
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium">
                                  {tApp("dialog.description")}
                                </DialogDescription>
                              </DialogHeader>

                              <Textarea
                                value={feedback}
                                onChange={(event) =>
                                  setFeedback(event.target.value)
                                }
                                className="min-h-[180px] rounded-none border-border/40 bg-muted/10 p-6 text-base"
                                placeholder={tApp("dialog.placeholder")}
                              />

                              <DialogFooter className="mt-6">
                                <Button
                                  variant="ghost"
                                  className="font-mono text-[10px] font-black uppercase tracking-[0.3em]"
                                >
                                  {tApp("actions.cancel")}
                                </Button>
                                <Button
                                  onClick={() => handleReject(update.id)}
                                  disabled={isRejecting === update.id}
                                  className="h-12 rounded-none bg-brand-primary px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white"
                                >
                                  {isRejecting === update.id ? (
                                    <CircleNotch className="mr-2 size-4 animate-spin" />
                                  ) : null}
                                  {tApp("actions.send_feedback")}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4
                          className={cn(
                            "font-heading text-xl font-black uppercase tracking-tight text-foreground/90 transition-colors group-hover:text-brand-primary",
                            update.approvalStatus === "APPROVED" &&
                              "text-brand-primary"
                          )}
                        >
                          {update.title}
                        </h4>
                        {update.description && (
                          <p className="text-sm leading-relaxed text-muted-foreground/60 max-w-2xl font-medium">
                            {update.description}
                          </p>
                        )}

                        <UpdateAttachmentsList
                          attachments={update.attachments}
                          compact
                        />

                        <div className="flex items-center gap-4">
                          {update.requiresApproval &&
                            update.approvalStatus === "PENDING" && (
                              <div className="flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1">
                                <Clock
                                  weight="fill"
                                  className="size-3 text-brand-primary"
                                />
                                <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary">
                                  Pendente
                                </span>
                              </div>
                            )}
                          {update.approvalStatus === "APPROVED" && (
                            <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1">
                              <CheckCircle
                                weight="fill"
                                className="size-3 text-green-500"
                              />
                              <span className="text-[8px] font-black uppercase tracking-widest text-green-500">
                                Aprovado
                              </span>
                            </div>
                          )}
                          {update.feedback && (
                            <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1">
                              <WarningCircle
                                weight="fill"
                                className="size-3 text-amber-500"
                              />
                              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">
                                Ajustes Solicitados
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <VersionsLog versions={project.versions || []} />
        </div>

        <aside className="space-y-12">
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40 border-b border-border/20 pb-4">
              {t("assets_repository")}
            </h3>

            {project.assets.length === 0 ? (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">
                {t("waiting_files")}
              </p>
            ) : (
              <div className="grid gap-4">
                {project.assets.map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-3 rounded-2xl border border-border/30 bg-background/30 p-5 transition-all hover:border-brand-primary/30 hover:bg-background shadow-sm hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                        <FileText weight="duotone" className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-black uppercase tracking-tight text-foreground/80 group-hover:text-brand-primary transition-colors">
                          {asset.name}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                          {t("view_document")}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <AuditTrail logs={project.auditLogs || []} />
        </aside>
      </div>
    </div>
  )
}
