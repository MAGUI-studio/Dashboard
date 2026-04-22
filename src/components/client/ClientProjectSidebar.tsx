"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/src/i18n/navigation"
import { 
  ProjectorScreen, 
  ClockCountdown, 
  CheckCircle, 
  Files, 
  NotePencil, 
  ChatTeardropDots 
} from "@phosphor-icons/react"

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
    <aside className="hidden w-64 shrink-0 flex-col gap-8 py-4 lg:flex">
      <nav className="flex flex-col gap-1.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href as any}
            className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              item.active
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "text-muted-foreground/50 hover:bg-muted/10 hover:text-foreground"
            }`}
          >
            <item.icon weight={item.active ? "fill" : "duotone"} className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
