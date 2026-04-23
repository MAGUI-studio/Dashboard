import * as React from "react"

import { startOfDay } from "date-fns"

import { AdminAttentionPanel } from "@/src/components/admin/AdminAttentionPanel"
import { AdminOperationsAgenda } from "@/src/components/admin/AdminOperationsAgenda"

import {
  getAdminDashboardAgenda,
  getAdminDashboardAttention,
} from "@/src/lib/admin-data"

export async function DashboardAttentionWidget() {
  const today = startOfDay(new Date()).toISOString()
  const [attentionItems, agendaItems] = await Promise.all([
    getAdminDashboardAttention(today),
    getAdminDashboardAgenda(today),
  ])

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <AdminAttentionPanel items={attentionItems} />
      <AdminOperationsAgenda items={agendaItems} />
    </section>
  )
}
