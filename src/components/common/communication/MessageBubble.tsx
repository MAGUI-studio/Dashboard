"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

import { Prisma } from "@/src/generated/client"
import {
  ChatCircleDots,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  ShieldCheck,
  VideoCamera,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"

import { cn } from "@/src/lib/utils/utils"

export interface MessageAuthor {
  id: string
  name: string | null
  role: string
  avatarUrl: string | null
}

export interface MessageAttachment {
  name: string
  url: string
  key: string
}

export interface MessageBubbleProps {
  id: string
  content: string
  type:
    | "INFORMATIVE"
    | "REQUIRES_RESPONSE"
    | "REQUIRES_APPROVAL"
    | "REQUIRES_ASSET"
    | "FINANCIAL"
    | "LEGAL"
    | "CALL_SUMMARY"
  author: MessageAuthor | null
  createdAt: Date
  requiresResponse?: boolean
  resolvedAt?: Date | null
  resolvedBy?: { name: string | null } | null
  attachments?: Prisma.JsonValue
  isOwnMessage?: boolean
  onResolve?: (id: string) => void
}

export function MessageBubble({
  id,
  content,
  type,
  author,
  createdAt,
  requiresResponse,
  resolvedAt,
  resolvedBy,
  attachments,
  isOwnMessage,
  onResolve,
}: MessageBubbleProps) {
  const t = useTranslations("Communication.messages")
  const locale = useLocale()
  const dateLocale = locale === "pt" ? ptBR : enUS

  const typeIcons = {
    INFORMATIVE: <ChatCircleDots className="size-4" />,
    REQUIRES_RESPONSE: <Clock className="size-4" />,
    REQUIRES_APPROVAL: <CheckCircle className="size-4" />,
    REQUIRES_ASSET: <FileText className="size-4" />,
    FINANCIAL: <CreditCard className="size-4" />,
    LEGAL: <ShieldCheck className="size-4" />,
    CALL_SUMMARY: <VideoCamera className="size-4" />,
  }

  const typeColors = {
    INFORMATIVE: "bg-muted/50 text-muted-foreground",
    REQUIRES_RESPONSE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    REQUIRES_APPROVAL: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    REQUIRES_ASSET: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    FINANCIAL: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    LEGAL: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    CALL_SUMMARY: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  }

  const parsedAttachments = (Array.isArray(attachments)
    ? attachments
    : []) as unknown as MessageAttachment[]

  return (
    <div
      className={cn(
        "flex w-full gap-4",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="size-10 border border-border/40">
          <AvatarImage src={author?.avatarUrl || ""} />
          <AvatarFallback className="font-heading text-xs font-black uppercase">
            {author?.name?.substring(0, 2) || "MA"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-2">
          {!isOwnMessage && (
            <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
              {author?.name || "MAGUI Team"}
            </span>
          )}
          <span className="text-[9px] font-medium text-muted-foreground/60">
            {format(new Date(createdAt), "HH:mm", { locale: dateLocale })}
          </span>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-[1.5rem] p-4 text-sm leading-relaxed",
            isOwnMessage
              ? "bg-brand-primary text-white rounded-tr-none"
              : "bg-muted/40 text-foreground rounded-tl-none border border-border/40"
          )}
        >
          {type !== "INFORMATIVE" && (
            <Badge
              variant="outline"
              className={cn(
                "mb-3 flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                isOwnMessage
                  ? "bg-white/10 border-white/20 text-white"
                  : typeColors[type]
              )}
            >
              {typeIcons[type]}
              {t(type.toLowerCase())}
            </Badge>
          )}

          <p className="whitespace-pre-wrap">{content}</p>

          {parsedAttachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {parsedAttachments.map((att: MessageAttachment, idx: number) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-bold transition-all",
                    isOwnMessage
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-background/80 hover:bg-background border border-border/40"
                  )}
                >
                  <FileText className="size-4" />
                  <span className="max-w-[120px] truncate">{att.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {requiresResponse && !resolvedAt && (
          <div className="mt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-full px-4 text-[9px] font-black uppercase tracking-wider"
              onClick={() => onResolve?.(id)}
            >
              <CheckCircle className="mr-1.5 size-3.5" />
              {t("reply")}
            </Button>
          </div>
        )}

        {resolvedAt && (
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600/70">
            <CheckCircle weight="fill" className="size-3.5" />
            {t("resolved_by", {
              name: resolvedBy?.name || "User",
              date: format(new Date(resolvedAt), "dd/MM", {
                locale: dateLocale,
              }),
            })}
          </div>
        )}
      </div>
    </div>
  )
}
