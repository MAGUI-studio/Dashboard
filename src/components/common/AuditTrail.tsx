"use client"

import * as React from "react"

import { DashboardAuditLog } from "@/src/types/dashboard"
import {
  CheckCircle,
  ClockCountdown,
  Fingerprint,
  NotePencil,
  WarningCircle,
} from "@phosphor-icons/react"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface AuditTrailProps {
  logs: DashboardAuditLog[]
}

function getAuditPresentation(action: string): {
  accentClassName: string
  icon: React.ReactNode
  label: string
} {
  if (action.includes("approved")) {
    return {
      accentClassName:
        "border-green-500/20 bg-green-500/8 text-green-700 dark:text-green-300",
      icon: <CheckCircle weight="fill" className="size-4" />,
      label: "Aprovação registrada",
    }
  }

  if (action.includes("rejected")) {
    return {
      accentClassName:
        "border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-300",
      icon: <WarningCircle weight="fill" className="size-4" />,
      label: "Ajustes solicitados",
    }
  }

  if (action.includes("updated")) {
    return {
      accentClassName:
        "border-sky-500/20 bg-sky-500/8 text-sky-700 dark:text-sky-300",
      icon: <NotePencil weight="fill" className="size-4" />,
      label: "Atualização registrada",
    }
  }

  return {
    accentClassName:
      "border-border/30 bg-background/40 text-muted-foreground/70",
    icon: <ClockCountdown weight="fill" className="size-4" />,
    label: "Registro do sistema",
  }
}

export function AuditTrail({ logs }: AuditTrailProps): React.JSX.Element {
  if (logs.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Fingerprint className="size-4 text-brand-primary" weight="duotone" />
          <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
            Trilha de auditoria
          </h3>
        </div>

        <div className="rounded-3xl bg-background/35 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/30">
            Nenhum registro ainda
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Fingerprint className="size-4 text-brand-primary" weight="duotone" />
        <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
          Trilha de auditoria
        </h3>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const presentation = getAuditPresentation(log.action)

          return (
            <article
              key={log.id}
              className="rounded-3xl bg-background/35 p-5 transition-colors hover:bg-background/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border ${presentation.accentClassName}`}
                  >
                    {presentation.icon}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em] ${presentation.accentClassName}`}
                      >
                        {presentation.label}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-[0.22em] text-muted-foreground/30">
                        {log.actor?.name || "Sistema"}
                      </span>
                    </div>

                    <p className="max-w-3xl text-sm font-medium leading-relaxed text-foreground/78">
                      {log.summary}
                    </p>
                  </div>
                </div>

                <span className="pt-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground/35">
                  {formatLocalTime(
                    new Date(log.createdAt),
                    "America/Sao_Paulo"
                  )}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
