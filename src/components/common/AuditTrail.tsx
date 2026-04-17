"use client"

import * as React from "react"

import { DashboardAuditLog } from "@/src/types/dashboard"
import { Fingerprint, Sparkle, UserCircle } from "@phosphor-icons/react"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface AuditTrailProps {
  logs: DashboardAuditLog[]
}

export function AuditTrail({ logs }: AuditTrailProps): React.JSX.Element {
  if (logs.length === 0) {
    return <div />
  }

  return (
    <section className="rounded-[2rem] border border-border/40 bg-muted/10 p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <Fingerprint className="size-5" weight="duotone" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
            Governança
          </p>
          <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
            Trilha de auditoria
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-3xl border border-border/30 bg-background/40 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                {log.actorType === "USER" ? (
                  <UserCircle className="size-4" weight="duotone" />
                ) : (
                  <Sparkle className="size-4" weight="duotone" />
                )}
                {log.action}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                {formatLocalTime(new Date(log.createdAt), "America/Sao_Paulo")}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {log.summary}
            </p>

            {log.actor && (
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                Responsável: {log.actor.name ?? "Usuário"} · {log.actor.role}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
