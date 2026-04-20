"use client"

import * as React from "react"

import { DashboardAuditLog } from "@/src/types/dashboard"

import { AuditTrail } from "@/src/components/common/AuditTrail"

interface ProjectAuditTabProps {
  logs: DashboardAuditLog[]
}

export function ProjectAuditTab({
  logs,
}: ProjectAuditTabProps): React.JSX.Element {
  return (
    <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
      <AuditTrail logs={logs} />
    </section>
  )
}
