"use client"

import * as React from "react"

import { UserRole } from "@/src/generated/client/enums"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  ClockCounterClockwise,
  FileArrowUp,
  FileText,
  FolderOpen,
  NotePencil,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export type ActivityKind =
  | "approval"
  | "project"
  | "asset"
  | "briefing"
  | "timeline"
  | "system"

export interface AdminActivityFeedItem {
  id: string
  action: string
  summary: string
  createdAt: string | Date
  actorName: string | null
  actorRole: UserRole | null
  projectName: string | null
  entityType: string
  kind: ActivityKind
  href:
    | string
    | {
        pathname: "/admin/projects/[id]"
        params: { id: string }
        query?: Record<string, string>
      }
}

const kindLabels: Record<ActivityKind, string> = {
  approval: "Aprovações",
  project: "Projetos",
  asset: "Arquivos",
  briefing: "Briefings",
  timeline: "Timeline",
  system: "Sistema",
}

function getActivityPresentation(kind: ActivityKind) {
  switch (kind) {
    case "approval":
      return {
        icon: CheckCircle,
        iconClassName:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        badgeClassName:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
      }
    case "asset":
      return {
        icon: FileArrowUp,
        iconClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
        badgeClassName:
          "border-sky-500/20 bg-sky-500/10 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
      }
    case "briefing":
      return {
        icon: FileText,
        iconClassName:
          "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
        badgeClassName:
          "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-800 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-200",
      }
    case "project":
      return {
        icon: FolderOpen,
        iconClassName:
          "bg-brand-primary/10 text-[oklch(0.43_0.14_245)] dark:text-brand-primary",
        badgeClassName:
          "border-brand-primary/20 bg-brand-primary/10 text-[oklch(0.43_0.14_245)] dark:border-brand-primary/20 dark:bg-brand-primary/10 dark:text-brand-primary",
      }
    case "timeline":
      return {
        icon: NotePencil,
        iconClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        badgeClassName:
          "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
      }
    default:
      return {
        icon: WarningCircle,
        iconClassName:
          "bg-background/70 text-muted-foreground dark:bg-background/30",
        badgeClassName:
          "border-border/30 bg-background/60 text-muted-foreground/80",
      }
  }
}

function formatRelativeMoment(value: string | Date): string {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))

  if (minutes < 60) {
    return `${minutes} min atrás`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `${hours} h atrás`
  }

  const days = Math.round(hours / 24)
  if (days < 7) {
    return `${days} d atrás`
  }

  return date.toLocaleDateString("pt-BR")
}

export function AdminActivityFeed({
  items,
}: {
  items: AdminActivityFeedItem[]
}): React.JSX.Element {
  const [activeKind, setActiveKind] = React.useState<"all" | ActivityKind>(
    "all"
  )

  const visibleItems = React.useMemo(
    () =>
      items.filter((item) => activeKind === "all" || item.kind === activeKind),
    [activeKind, items]
  )

  const totalsByKind = React.useMemo(
    () =>
      items.reduce<Record<ActivityKind, number>>(
        (acc, item) => {
          acc[item.kind] += 1
          return acc
        },
        {
          approval: 0,
          project: 0,
          asset: 0,
          briefing: 0,
          timeline: 0,
          system: 0,
        }
      ),
    [items]
  )

  return (
    <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <div className="flex flex-col gap-5">
          <div>
            <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
              Atividade global
            </CardTitle>
            <CardDescription>
              O que mudou recentemente nos projetos e no fluxo operacional.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={activeKind === "all" ? "default" : "outline"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setActiveKind("all")}
            >
              Tudo
              <span className="ml-2 text-[9px] opacity-70">{items.length}</span>
            </Button>

            {(
              [
                "approval",
                "project",
                "asset",
                "briefing",
                "timeline",
                "system",
              ] as const
            ).map((kind) => (
              <Button
                key={kind}
                type="button"
                variant={activeKind === kind ? "default" : "outline"}
                className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
                onClick={() => setActiveKind(kind)}
              >
                {kindLabels[kind]}
                <span className="ml-2 text-[9px] opacity-70">
                  {totalsByKind[kind]}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 pt-6">
        {visibleItems.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            Nenhuma atividade encontrada para esse filtro.
          </div>
        ) : (
          visibleItems.map((item) => {
            const presentation = getActivityPresentation(item.kind)
            const Icon = presentation.icon

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-start md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 flex size-10 items-center justify-center rounded-2xl ${presentation.iconClassName}`}
                  >
                    <Icon className="size-5" weight="duotone" />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em] ${presentation.badgeClassName}`}
                      >
                        {kindLabels[item.kind]}
                      </span>

                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {item.projectName || "Operação interna"}
                      </span>
                    </div>

                    <p className="text-base font-black tracking-tight text-foreground">
                      {item.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/75">
                      <span>
                        {item.actorName || "Sistema"}
                        {item.actorRole ? ` • ${item.actorRole}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockCounterClockwise className="size-3.5" />
                        {formatRelativeMoment(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  <Link href={item.href as never}>
                    Abrir
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
