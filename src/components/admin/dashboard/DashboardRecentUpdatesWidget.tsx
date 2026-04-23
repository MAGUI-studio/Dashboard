import * as React from "react"

import { getTranslations } from "next-intl/server"

import { ApprovalStatus } from "@/src/generated/client/enums"
import { CheckCircle, NotePencil } from "@phosphor-icons/react/dist/ssr"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import {
  getAdminDashboardDueActionItems,
  getAdminDashboardRecentUpdates,
} from "@/src/lib/admin-data"

export async function DashboardRecentUpdatesWidget() {
  const t = await getTranslations("Dashboard")
  const [recentUpdates, dueActionItems] = await Promise.all([
    getAdminDashboardRecentUpdates(),
    getAdminDashboardDueActionItems(),
  ])

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
            {t("recent_updates.title")}
          </CardTitle>
          <CardDescription>{t("recent_updates.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6">
          {recentUpdates.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
              {t("recent_updates.empty")}
            </div>
          ) : (
            recentUpdates.map((update) => (
              <div
                key={update.id}
                className="rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <p className="text-base font-black tracking-tight text-foreground">
                      {update.title}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                      {update.project.name}
                    </p>
                  </div>
                  {update.approvalStatus === ApprovalStatus.APPROVED ? (
                    <CheckCircle
                      className="size-5 text-emerald-500"
                      weight="fill"
                    />
                  ) : (
                    <NotePencil
                      className="size-5 text-brand-primary"
                      weight="duotone"
                    />
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground/75">
                  {update.description || t("common.no_description")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
            {t("action_items.title")}
          </CardTitle>
          <CardDescription>{t("action_items.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6">
          {dueActionItems.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
              {t("action_items.empty")}
            </div>
          ) : (
            dueActionItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
              >
                <div className="grid gap-1">
                  <p className="text-base font-black tracking-tight text-foreground">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    {item.project.name}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                  {item.dueDate
                    ? new Date(item.dueDate).toLocaleDateString()
                    : t("action_items.no_date")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  )
}
