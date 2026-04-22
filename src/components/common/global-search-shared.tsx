"use client"

import * as React from "react"

import {
  Buildings,
  ChartLineUp,
  ClockCounterClockwise,
  File,
  FolderOpen,
  Sparkle,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { CommandGroup, CommandItem } from "@/src/components/ui/command"

import type { GlobalSearchResult } from "@/src/lib/actions/search.actions"

export type SearchGroupKey =
  | "client"
  | "project"
  | "lead"
  | "update"
  | "asset"
  | "activity"

export type SearchGroupConfig = {
  key: SearchGroupKey
  heading: string
  emptyLabel: string
  icon: React.ComponentType<{ className?: string }>
}

export const SEARCH_GROUPS: SearchGroupConfig[] = [
  {
    key: "client",
    heading: "Clientes",
    emptyLabel: "Clientes e contas",
    icon: Buildings,
  },
  {
    key: "project",
    heading: "Projetos",
    emptyLabel: "Projetos ativos",
    icon: FolderOpen,
  },
  {
    key: "lead",
    heading: "Comercial",
    emptyLabel: "Leads e contatos",
    icon: ChartLineUp,
  },
  {
    key: "update",
    heading: "Updates",
    emptyLabel: "Timeline dos projetos",
    icon: Sparkle,
  },
  {
    key: "asset",
    heading: "Arquivos",
    emptyLabel: "Materiais e assets",
    icon: File,
  },
  {
    key: "activity",
    heading: "Atividades",
    emptyLabel: "Auditoria e histórico",
    icon: ClockCounterClockwise,
  },
]

export function getGroupedResults(results: GlobalSearchResult[]) {
  return {
    client: results.filter((item) => item.type === "client"),
    project: results.filter((item) => item.type === "project"),
    lead: results.filter((item) => item.type === "lead"),
    update: results.filter((item) => item.type === "update"),
    asset: results.filter((item) => item.type === "asset"),
    activity: results.filter((item) => item.type === "activity"),
  }
}

export function SearchResultSection({
  config,
  results,
  onSelect,
  compact = false,
}: {
  config: SearchGroupConfig
  results: GlobalSearchResult[]
  onSelect: (result: GlobalSearchResult) => void
  compact?: boolean
}) {
  if (results.length === 0) {
    return null
  }

  const Icon = config.icon

  return (
    <CommandGroup
      heading={config.heading}
      className="rounded-[1.75rem] border border-border/35 bg-background/45 p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.22em]"
    >
      {results.map((result) => (
        <CommandItem
          key={result.id}
          value={`${result.title} ${result.subtitle} ${result.meta}`}
          onSelect={() => onSelect(result)}
          className={`cursor-pointer rounded-[1.2rem] border border-transparent px-3 ${compact ? "py-2.5" : "py-3"} data-[selected=true]:border-border/40 data-[selected=true]:bg-muted/80`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted/75 text-foreground/70">
              <Icon className="size-4" />
            </div>

            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-black tracking-tight text-foreground">
                {result.title}
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
                {result.subtitle}
              </p>
            </div>
          </div>

          <span className="ml-auto rounded-full border border-border/35 bg-background/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            {result.meta}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

export function SearchCountPills({
  grouped,
  groups,
}: {
  grouped: ReturnType<typeof getGroupedResults>
  groups: SearchGroupConfig[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group) => (
        <div
          key={group.key}
          className="rounded-full border border-border/35 bg-background/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55"
        >
          {group.heading}{" "}
          <span className="text-foreground/70">
            {grouped[group.key].length}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AdvancedSearchButton({
  onClick,
  label = "Ir para busca avançada",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
    >
      {label}
    </Button>
  )
}
