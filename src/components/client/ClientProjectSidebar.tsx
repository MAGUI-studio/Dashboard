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

interface ClientProjectSidebarProps {
  projectId: string
}

export function ClientProjectSidebar({ projectId }: ClientProjectSidebarProps) {
  const t = useTranslations("Dashboard.client_home.links")
  const pathname = usePathname()

  const items = [
    {
      label: "Geral",
      href: `/projects/${projectId}`,
      icon: ProjectorScreen,
      active: pathname === `/projects/${projectId}`,
    },
    {
      label: t("timeline"),
      href: `/projects/${projectId}/timeline`,
      icon: ClockCountdown,
      active: pathname === `/projects/${projectId}/timeline`,
    },
    {
      label: "Validações",
      href: `/projects/${projectId}/approvals`,
      icon: CheckCircle,
      active: pathname === `/projects/${projectId}/approvals`,
    },
    {
      label: t("files"),
      href: `/projects/${projectId}/files`,
      icon: Files,
      active: pathname === `/projects/${projectId}/files`,
    },
    {
      label: t("briefing"),
      href: `/projects/${projectId}/briefing`,
      icon: NotePencil,
      active: pathname === `/projects/${projectId}/briefing`,
    },
    {
      label: t("tasks"),
      href: `/projects/${projectId}/tasks`,
      icon: ChatTeardropDots,
      active: pathname === `/projects/${projectId}/tasks`,
    },
  ]

  return (
    <div className="sticky top-20 z-20 -mx-6 border-y border-border/15 bg-background/90 px-6 py-3 backdrop-blur-xl lg:-mx-12 lg:px-12">
      <nav className="mx-auto flex w-full max-w-440 items-center gap-2 overflow-x-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={toHref(item.href)}
            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
              item.active
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "border border-border/20 bg-background/60 text-muted-foreground/60 hover:border-brand-primary/25 hover:text-foreground"
            }`}
          >
            <item.icon
              weight={item.active ? "fill" : "duotone"}
              className="size-5"
            />
            {item.label}
          </Link>
        ))}
        <span className="ml-auto hidden items-center gap-2 rounded-full bg-muted/5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45 xl:inline-flex">
          Avance pelas secoes
          <ArrowRight weight="bold" className="size-3" />
        </span>
      </nav>
    </div>
  )
}
