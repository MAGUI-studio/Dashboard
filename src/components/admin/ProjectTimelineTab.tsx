import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardUpdate } from "@/src/types/dashboard"
import {
  CheckCircle,
  Clock,
  HourglassSimple,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { AddTimelineForm } from "@/src/components/admin/AddTimelineForm"
import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface ProjectTimelineTabProps {
  projectId: string
  updates: DashboardUpdate[]
}

function UpdateStatusPill({
  update,
}: {
  update: DashboardUpdate
}): React.JSX.Element {
  if (!update.requiresApproval) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
        <CheckCircle weight="fill" className="size-3 text-brand-primary" />
        Publicado
      </div>
    )
  }

  if (update.approvalStatus === "APPROVED") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-green-600">
        <CheckCircle weight="fill" className="size-3" />
        Aprovado
      </div>
    )
  }

  if (update.approvalStatus === "REJECTED") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
        <WarningCircle weight="fill" className="size-3" />
        Ajustes Solicitados
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
      <HourglassSimple weight="fill" className="size-3" />
      Pendente de Aprovação
    </div>
  )
}

export function ProjectTimelineTab({
  projectId,
  updates,
}: ProjectTimelineTabProps) {
  const t = useTranslations("Admin.projects.details")

  return (
    <div className="flex flex-col gap-12">
      <AddTimelineForm projectId={projectId} />

      <section className="flex flex-col gap-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("timeline_title")}
        </h3>

        <div className="ml-4 flex flex-col gap-0 border-l border-border/40">
          {updates.map((update) => (
            <div key={update.id} className="relative pb-12 pl-12 last:pb-0">
              <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-background bg-brand-primary shadow-sm shadow-brand-primary/20" />
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/40">
                  <div className="flex items-center gap-2">
                    <Clock
                      weight="bold"
                      className="size-3.5 text-brand-primary/60"
                    />
                    <span>
                      {formatLocalTime(
                        new Date(update.createdAt),
                        update.timezone
                      )}
                    </span>
                  </div>

                  {update.isMilestone && (
                    <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                      Marco
                    </span>
                  )}

                  <UpdateStatusPill update={update} />
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                    {update.title}
                  </h4>

                  {update.description && (
                    <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/60">
                      {update.description}
                    </p>
                  )}

                  {update.feedback && (
                    <div className="max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600">
                        Feedback do cliente
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-amber-700/90">
                        {update.feedback}
                      </p>
                    </div>
                  )}

                  <UpdateAttachmentsList attachments={update.attachments} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
