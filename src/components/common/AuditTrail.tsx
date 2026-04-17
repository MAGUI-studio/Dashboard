"use client"

import * as React from "react"

import { DashboardAuditLog } from "@/src/types/dashboard"
import { Fingerprint } from "@phosphor-icons/react"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface AuditTrailProps {
  logs: DashboardAuditLog[]
}

export function AuditTrail({ logs }: AuditTrailProps): React.JSX.Element {
  if (logs.length === 0) {
    return <div />
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border/20 pb-4">
        <Fingerprint className="size-4 text-brand-primary" weight="duotone" />
        <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
          Trilha de Auditoria
        </h3>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="group relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border/30 group-hover:bg-brand-primary/40 transition-colors" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-brand-primary/60">
                  {log.action.split(".").pop()}
                </span>
                <span className="font-mono text-[8px] font-bold text-muted-foreground/30">
                  {formatLocalTime(
                    new Date(log.createdAt),
                    "America/Sao_Paulo"
                  )}
                </span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/70">
                {log.summary}
              </p>
              <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">
                {log.actor?.name || "Sistema"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
