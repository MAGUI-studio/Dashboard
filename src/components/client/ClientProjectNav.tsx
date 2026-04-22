"use client"
import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  ChatTeardropDotsIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  FilesIcon,
  NotePencilIcon,
  ProjectorScreenIcon,
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
      icon: ProjectorScreenIcon,
      exact: true,
    },
    {
      label: t("timeline"),
      href: `/projects/${projectId}/timeline`,
      icon: ClockCountdownIcon,
    },
    {
      label: t("approvals"),
      href: `/projects/${projectId}/approvals`,
      icon: CheckCircleIcon,
    },
    {
      label: t("files"),
      href: `/projects/${projectId}/files`,
      icon: FilesIcon,
    },
    {
      label: t("briefing"),
      href: `/projects/${projectId}/briefing`,
      icon: NotePencilIcon,
    },
    {
      label: t("tasks"),
      href: `/projects/${projectId}/tasks`,
      icon: ChatTeardropDotsIcon,
    },
  ]

  return (
    <div className="px-5 py-3 sm:px-6 lg:px-12 pt-12">
      <nav
        aria-label={t("overview")}
        className="mx-auto flex w-full max-w-440 items-center gap-6 overflow-x-auto no-scrollbar"
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
              className={`relative inline-flex h-9 shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground/55 hover:text-foreground"
              }`}
            >
              <item.icon
                weight={isActive ? "fill" : "duotone"}
                className="size-5"
              />
              {item.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-3 h-0.5 rounded-full bg-brand-primary" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
