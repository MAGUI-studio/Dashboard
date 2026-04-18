import * as React from "react"

import { useTranslations } from "next-intl"

import { Clock } from "@phosphor-icons/react/dist/ssr"

import { AddTimelineForm } from "@/src/components/admin/AddTimelineForm"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface ProjectTimelineTabProps {
  projectId: string
  updates: Array<{
    id: string
    title: string
    description: string | null
    createdAt: Date | string
    timezone: string
  }>
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

        <div className="flex flex-col gap-0 border-l border-border/40 ml-4">
          {updates.map((update) => (
            <div key={update.id} className="relative pl-12 pb-12 last:pb-0">
              <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-background bg-brand-primary shadow-sm shadow-brand-primary/20" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
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
                <h4 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                  {update.title}
                </h4>
                {update.description && (
                  <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/60">
                    {update.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
