"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

import { ChatCircleDots, CheckCircle } from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"

import { Badge } from "@/src/components/ui/badge"

import { cn } from "@/src/lib/utils/utils"

export interface ThreadItem {
  id: string
  title: string | null
  entityType: string
  status: "OPEN" | "RESOLVED" | "ARCHIVED"
  updatedAt: Date
  lastMessage?: {
    content: string
    createdAt: Date
  }
}

interface ThreadListProps {
  threads: ThreadItem[]
  activeThreadId?: string
  onThreadClick: (id: string) => void
}

export function ThreadList({
  threads,
  activeThreadId,
  onThreadClick,
}: ThreadListProps) {
  const t = useTranslations("Communication.threads")
  const locale = useLocale()
  const dateLocale = locale === "pt" ? ptBR : enUS

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <ChatCircleDots className="size-12 text-muted-foreground/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          Nenhuma conversa encontrada.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onThreadClick(thread.id)}
          className={cn(
            "flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-all hover:bg-muted/30",
            activeThreadId === thread.id
              ? "border-brand-primary/40 bg-brand-primary/[0.03] ring-1 ring-brand-primary/20"
              : "border-border/40 bg-transparent"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-heading text-sm font-black uppercase tracking-tight">
              {thread.title || t(`${thread.entityType.toLowerCase()}_context`)}
            </span>
            <span className="whitespace-nowrap text-[9px] font-medium text-muted-foreground/60">
              {formatDistanceToNow(new Date(thread.updatedAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="line-clamp-1 flex-1 text-[11px] font-medium text-muted-foreground/70">
              {thread.lastMessage?.content || "Inicie a conversa..."}
            </p>
            {thread.status === "RESOLVED" ? (
              <CheckCircle weight="fill" className="size-4 text-emerald-500" />
            ) : (
              <Badge
                variant="outline"
                className="h-4 rounded-full border-brand-primary/20 bg-brand-primary/10 px-1.5 py-0 text-[8px] font-black uppercase tracking-wider text-brand-primary"
              >
                {t("open")}
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
