"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

import {
  Calendar,
  CurrencyCircleDollar,
  Scales,
  ShieldCheck,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"

import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export interface DecisionItem {
  id: string
  title: string
  description: string | null
  decision: string
  impactScope: string | null
  impactDeadline: string | null
  impactFinancial: string | null
  decidedAt: Date
  decidedBy?: { name: string | null } | null
}

interface DecisionCardProps {
  decision: DecisionItem
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const t = useTranslations("Communication.decisions")
  const locale = useLocale()
  const dateLocale = locale === "pt" ? ptBR : enUS

  return (
    <Card className="overflow-hidden rounded-[1.8rem] border-emerald-500/20 bg-emerald-500/[0.02] shadow-none">
      <CardHeader className="border-b border-emerald-500/10 bg-emerald-500/[0.03] pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Scales weight="fill" className="size-4" />
            </div>
            <CardTitle className="font-heading text-lg font-black uppercase tracking-tight text-emerald-900 dark:text-emerald-100">
              {decision.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-[9px] font-black uppercase tracking-wider text-emerald-700"
          >
            Decidido
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">
            {t("form.decision")}
          </span>
          <p className="text-sm font-medium leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
            {decision.decision}
          </p>
        </div>

        {decision.description && (
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {t("form.description")}
            </span>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              {decision.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-emerald-500/5 p-4 border border-emerald-500/10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700/70">
              <ShieldCheck className="size-3" />
              {t("impact.scope")}
            </div>
            <p className="text-[11px] font-bold text-emerald-900/90 dark:text-emerald-100/90">
              {decision.impactScope || t("impact.none")}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700/70">
              <Calendar className="size-3" />
              {t("impact.deadline")}
            </div>
            <p className="text-[11px] font-bold text-emerald-900/90 dark:text-emerald-100/90">
              {decision.impactDeadline || t("impact.none")}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700/70">
              <CurrencyCircleDollar className="size-3" />
              {t("impact.financial")}
            </div>
            <p className="text-[11px] font-bold text-emerald-900/90 dark:text-emerald-100/90">
              {decision.impactFinancial || t("impact.none")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-emerald-500/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-muted-foreground/60">
              Registrado por:
              <span className="ml-1 font-bold text-emerald-600/80 uppercase">
                {decision.decidedBy?.name || "MAGUI Studio"}
              </span>
            </span>
          </div>
          <span className="text-[9px] font-medium text-muted-foreground/60">
            {format(new Date(decision.decidedAt), "dd 'de' MMMM, yyyy", {
              locale: dateLocale,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
