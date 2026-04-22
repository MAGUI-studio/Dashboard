import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  ClockCountdown,
  NotePencil,
  Warning,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import type { AppHref } from "@/src/lib/utils/navigation"

interface ClientActionBannerProps {
  type:
    | "briefing"
    | "approval"
    | "task_overdue"
    | "task"
    | "new_update"
    | "default"
  eyebrow: string
  title: string
  description: string
  href: AppHref
  label: string
  projectName?: string
}

export function ClientActionBanner({
  type,
  eyebrow,
  title,
  description,
  href,
  label,
  projectName,
}: ClientActionBannerProps): React.JSX.Element {
  const iconMap = {
    briefing: NotePencil,
    approval: CheckCircle,
    task_overdue: Warning,
    task: ClockCountdown,
    new_update: ArrowRight,
    default: ArrowRight,
  }
  const Icon = iconMap[type]

  return (
    <section className="overflow-hidden rounded-[2rem] border border-brand-primary/20 bg-brand-primary/10 p-6 shadow-2xl shadow-brand-primary/10 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex size-16 items-center justify-center rounded-[1.35rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
          <Icon weight="duotone" className="size-8" />
        </div>

        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary/70">
            {projectName ? `${projectName} / ` : ""}
            {eyebrow}
          </p>
          <h2 className="font-heading text-3xl font-black uppercase leading-none tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75 sm:text-base">
            {description}
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="h-14 rounded-full bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href={href}>
            {label}
            <ArrowRight weight="bold" className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
