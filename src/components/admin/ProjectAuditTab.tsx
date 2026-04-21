"use client"

import * as React from "react"

import { DashboardAuditLog } from "@/src/types/dashboard"

import { AuditTrail } from "@/src/components/common/AuditTrail"

import { ExportProjectApprovalsButton } from "@/src/components/admin/ExportProjectApprovalsButton"

interface ProjectAuditTabProps {
  logs: DashboardAuditLog[]
  projectId: string
}

export function ProjectAuditTab({
  logs,
  projectId,
}: ProjectAuditTabProps): React.JSX.Element {
  return (
    <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
      <div className="mb-8 flex flex-col gap-4 border-b border-border/30 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.32em] text-muted-foreground/45">
            Auditoria
          </p>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75">
            Histórico técnico das ações importantes do projeto, incluindo
            origem, entidades relacionadas e mudanças críticas.
          </p>
        </div>

        <ExportProjectApprovalsButton projectId={projectId} />
      </div>

      <AuditTrail logs={logs} />
    </section>
  )
}
