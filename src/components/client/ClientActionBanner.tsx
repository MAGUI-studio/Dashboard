import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  NotePencilIcon,
  WarningIcon,
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
    briefing: NotePencilIcon,
    approval: CheckCircleIcon,
    task_overdue: WarningIcon,
    task: ClockCountdownIcon,
    new_update: ArrowRightIcon,
    default: ArrowRightIcon,
  }
  const Icon = iconMap[type]

  return (
    <section className="overflow-hidden rounded-[2rem] border border-yellow-600/20 bg-linear-to-b from-yellow-700 to-yellow-600 p-5 shadow-2xl shadow-yellow-600/10 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-yellow-600 text-white shadow-xl shadow-yellow-600/20">
          <Icon weight="duotone" className="size-8" />
        </div>

        <div className="min-w-0 space-y-2 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.24em]">
            {projectName ? `${projectName} / ` : ""}
            {eyebrow}
          </p>
          <h2 className="font-heading text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm font-medium leading-relaxed sm:text-base">
            {description}
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="h-14 rounded-full border border-white/20 bg-white/10 px-6 font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/20 active:scale-95 group"
        >
          <Link href={href}>
            {label}
            <ArrowRightIcon
              weight="bold"
              className="ml-2 size-4 group-hover:translate-x-0.5  transition-all duration-300"
            />
          </Link>
        </Button>
      </div>
    </section>
  )
}
