"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  ArrowRight,
  ChatTeardropDots,
  CheckCircle,
  ClockCountdown,
  Files,
  NotePencil,
  ProjectorScreen,
} from "@phosphor-icons/react"

import { toHref } from "@/src/lib/utils/navigation"

interface ClientProjectNavProps {
  projectId: string
}

export function ClientProjectNav({ projectId }: ClientProjectNavProps) {
  const t = useTranslations("Dashboard.client_home.project.nav")
  const pathname = usePathname()

  const items = [
    {
      label: t("overview"),
      href: `/projects/${projectId}`,
      icon: ProjectorScreen,
      exact: true,
    },
    {
      label: t("timeline"),
      href: `/projects/${projectId}/timeline`,
      icon: ClockCountdown,
    },
    {
      label: t("approvals"),
      href: `/projects/${projectId}/approvals`,
      icon: CheckCircle,
    },
    {
      label: t("files"),
      href: `/projects/${projectId}/files`,
      icon: Files,
    },
    {
      label: t("briefing"),
      href: `/projects/${projectId}/briefing`,
      icon: NotePencil,
    },
    {
      label: t("tasks"),
      href: `/projects/${projectId}/tasks`,
      icon: ChatTeardropDots,
    },
  ]

  return (
    <div className="sticky top-20 z-20 border-y border-border/15 bg-background/90 px-5 py-3 backdrop-blur-xl sm:px-6 lg:px-12">
      <nav
        aria-label={t("overview")}
        className="mx-auto flex w-full max-w-440 items-center gap-2 overflow-x-auto no-scrollbar"
      >
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={toHref(item.href)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em] transition-all active:scale-95 ${
                isActive
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                  : "border border-border/20 bg-background/60 text-muted-foreground/60 hover:border-brand-primary/25 hover:text-foreground"
              }`}
            >
              <item.icon
                weight={isActive ? "fill" : "duotone"}
                className="size-5"
              />
              {item.label}
            </Link>
          )
        })}
        <span className="ml-auto hidden items-center gap-2 rounded-full bg-muted/5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45 xl:inline-flex">
          {t("hint")}
          <ArrowRight weight="bold" className="size-3" />
        </span>
      </nav>
    </div>
  )
}
