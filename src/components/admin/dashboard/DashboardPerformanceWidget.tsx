import * as React from "react"

import { AdminCommercialHealthList } from "@/src/components/admin/AdminCommercialHealthList"
import { AdminOperationsPerformance } from "@/src/components/admin/AdminOperationsPerformance"

import {
  getAdminDashboardHealth,
  getAdminDashboardPerformance,
} from "@/src/lib/admin-data"

export async function DashboardPerformanceWidget() {
  const [perf, health] = await Promise.all([
    getAdminDashboardPerformance(),
    getAdminDashboardHealth(),
  ])

  const operationsMetrics = [
    {
      label: "Aprovação média",
      value:
        perf.averageApprovalHours > 0 ? `${perf.averageApprovalHours}h` : "—",
      hint: "tempo até aprovar entrega",
    },
    {
      label: "Projetos ativos",
      value: String(perf.activeProjectsCount),
      hint: `${perf.silentProjectsCount} sem update recente`,
    },
    {
      label: "Leads estagnados",
      value: String(perf.stagnantLeadsCount),
      hint: `${health.commercialHealth.filter((item) => item.tone === "risk").length} em risco`,
    },
  ]

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <AdminCommercialHealthList items={health.commercialHealth} />
      <AdminOperationsPerformance
        metrics={operationsMetrics}
        projectDistribution={perf.projectDistribution}
        leadDistribution={perf.leadDistribution}
        silentProjects={perf.silentProjects}
      />
    </section>
  )
}
