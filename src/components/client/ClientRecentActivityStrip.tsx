import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  FolderOpen,
  NewspaperClipping,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { toHref } from "@/src/lib/utils/navigation"

interface ActivityItem {
  id: string
  title: string
  type: "update" | "approval" | "file" | "task"
  projectName: string
  createdAt: Date | string
  href: string
}

interface ClientRecentActivityStripProps {
  activities: ActivityItem[]
}

export async function ClientRecentActivityStrip({
  activities,
}: ClientRecentActivityStripProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home.activity")

  const iconMap = {
    update: NewspaperClipping,
    approval: CheckCircle,
    file: FolderOpen,
    task: NotePencil,
  }

  return (
    <Card className="rounded-[2rem] border-border/40 bg-muted/5 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/15 px-8 py-6">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-xl font-black uppercase tracking-tight">
            {t("title")}
          </CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/45">
            {t("subtitle")}
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-0 p-0">
        {activities.length === 0 ? (
          <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            {t("empty")}
          </div>
        ) : (
          activities.map((item, index) => {
            const Icon = iconMap[item.type]
            return (
              <Link
                key={item.id}
                href={toHref(item.href)}
                className={`flex items-center justify-between gap-6 px-8 py-5 transition-colors hover:bg-muted/10 ${
                  index !== activities.length - 1
                    ? "border-b border-border/10"
                    : ""
                }`}
              >
                <div className="flex items-center gap-5 overflow-hidden">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/40 text-brand-primary shadow-sm ring-1 ring-border/20">
                    <Icon weight="duotone" className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <p className="truncate text-sm font-black tracking-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {item.projectName} •{" "}
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground/30" />
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
