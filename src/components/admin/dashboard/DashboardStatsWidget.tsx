import * as React from "react"

import { getTranslations } from "next-intl/server"

import {
  ChartLineUp,
  ClockCountdown,
  FolderOpen,
  Users,
} from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent } from "@/src/components/ui/card"

import { getAdminDashboardSummary } from "@/src/lib/admin-data"

interface DashboardStatsWidgetProps {
  userId: string
}

export async function DashboardStatsWidget({
  userId,
}: DashboardStatsWidgetProps) {
  const t = await getTranslations("Dashboard")
  const stats = await getAdminDashboardSummary(userId)

  const items = [
    {
      label: t("clients.stats.active_clients"),
      value: stats.totalClients,
      hint: t("clients.stats.base_registered"),
      icon: Users,
    },
    {
      label: t("clients.stats.active_projects"),
      value: stats.activeProjects,
      hint: "vários concluídos", // simplify hint or fetch more data
      icon: FolderOpen,
    },
    {
      label: t("clients.stats.pending_approvals"),
      value: stats.pendingApprovals,
      hint: t("clients.stats.review_today"),
      icon: ClockCountdown,
    },
    {
      label: t("clients.stats.open_leads"),
      value: stats.activeLeads,
      hint: t("clients.stats.unread_notifications", {
        count: stats.unreadNotifications,
      }),
      icon: ChartLineUp,
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.label}
          className="rounded-[1.75rem] border-border/40 bg-muted/10 backdrop-blur-md"
        >
          <CardContent className="flex items-start justify-between gap-4 pt-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/50">
                {item.label}
              </p>
              <p className="mt-3 text-4xl font-black tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                {item.hint}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <item.icon className="size-6" weight="duotone" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
