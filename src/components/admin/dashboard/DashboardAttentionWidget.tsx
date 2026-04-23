import * as React from "react"

import { addDays, isAfter, isBefore, startOfDay } from "date-fns"

import {
  type AdminAttentionItem,
  AdminAttentionPanel,
} from "@/src/components/admin/AdminAttentionPanel"
import {
  type AdminAgendaItem,
  AdminOperationsAgenda,
} from "@/src/components/admin/AdminOperationsAgenda"

import {
  getAdminDashboardAgenda,
  getAdminDashboardAttention,
} from "@/src/lib/admin-data"

export async function DashboardAttentionWidget() {
  const now = new Date()
  const today = startOfDay(now)
  const nextSevenDays = addDays(today, 7)
  const todayIso = today.toISOString()

  const [attention, agenda] = await Promise.all([
    getAdminDashboardAttention(todayIso),
    getAdminDashboardAgenda(todayIso),
  ])

  const attentionItems: AdminAttentionItem[] = [
    ...attention.pendingApprovals.slice(0, 2).map((approval) => ({
      id: `approval-${approval.id}`,
      title: approval.title,
      description: `${approval.project.name} esta aguardando validacao do time.`,
      href: {
        pathname: "/admin/projects/[id]" as const,
        params: { id: approval.project.id },
        query: { tab: "timeline", highlight: approval.id },
      },
      kind: "approval" as const,
      priority: "high" as const,
    })),
    ...attention.deadlineProjects.map((project) => ({
      id: `deadline-${project.id}`,
      title: `Prazo proximo: ${project.name}`,
      description: `Entrega prevista para ${new Date(project.deadline!).toLocaleDateString("pt-BR")}.`,
      href: {
        pathname: "/admin/projects/[id]" as const,
        params: { id: project.id },
      },
      kind: "deadline" as const,
      priority: "high" as const,
    })),
    ...attention.stagnantLeads.map((lead) => ({
      id: `lead-${lead.id}`,
      title: `${lead.companyName} sem retorno recente`,
      description: `Lead parado desde ${new Date(lead.updatedAt).toLocaleDateString("pt-BR")} na etapa ${lead.status}.`,
      href: `/admin/crm?lead=${lead.id}`,
      kind: "lead" as const,
      priority: "medium" as const,
    })),
    ...attention.overdueActionItems.map((item) => ({
      id: `task-${item.id}`,
      title: `${item.title} esta vencida`,
      description: `${item.project.name} tinha prazo em ${new Date(item.dueDate!).toLocaleDateString("pt-BR")}.`,
      href: {
        pathname: "/admin/projects/[id]" as const,
        params: { id: item.project.id },
      },
      kind: "task" as const,
      priority: "high" as const,
    })),
    ...attention.projectsNeedingUpdates.map((project) => ({
      id: `project-${project.id}`,
      title: `${project.name} sem update recente`,
      description: `Nao houve nova atualizacao publicada recentemente para ${project.client.name || project.client.email}.`,
      href: {
        pathname: "/admin/projects/[id]" as const,
        params: { id: project.id },
      },
      kind: "project" as const,
      priority: "medium" as const,
    })),
  ].slice(0, 6)

  const agendaItems: AdminAgendaItem[] = [
    ...agenda.deadlines.map((project) => ({
      id: `agenda-deadline-${project.id}`,
      title: project.name,
      dateLabel: `Prazo • ${new Date(project.deadline!).toLocaleDateString("pt-BR")}`,
      dateValue: project.deadline!.toISOString(),
      context: `${project.client.name || project.client.email} • ${project.progress}% de progresso declarado`,
      kind: "deadline" as const,
      href: {
        pathname: "/admin/projects/[id]" as const,
        params: { id: project.id },
      },
    })),
    ...agenda.actionItems
      .filter(
        (item) =>
          item.dueDate &&
          isAfter(new Date(item.dueDate), today) &&
          isBefore(new Date(item.dueDate), nextSevenDays)
      )
      .slice(0, 4)
      .map((item) => ({
        id: `agenda-action-${item.id}`,
        title: item.title,
        dateLabel: `Action item • ${new Date(item.dueDate!).toLocaleDateString("pt-BR")}`,
        dateValue: item.dueDate!.toISOString(),
        context: item.project.name,
        kind: "task" as const,
        href: {
          pathname: "/admin/projects/[id]" as const,
          params: { id: item.project.id },
        },
      })),
    ...agenda.followUps
      .filter(
        (lead) =>
          lead.nextActionAt &&
          isAfter(new Date(lead.nextActionAt), today) &&
          isBefore(new Date(lead.nextActionAt), nextSevenDays)
      )
      .slice(0, 4)
      .map((lead) => ({
        id: `agenda-lead-${lead.id}`,
        title: lead.companyName,
        dateLabel: `Retomar contato • ${new Date(lead.nextActionAt!).toLocaleDateString("pt-BR")}`,
        dateValue: lead.nextActionAt!.toISOString(),
        context: lead.contactName || "Lead sem contato principal definido",
        kind: "lead" as const,
        href: `/admin/crm?lead=${lead.id}`,
      })),
  ].slice(0, 10)

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <AdminAttentionPanel items={attentionItems} />
      <AdminOperationsAgenda items={agendaItems} />
    </section>
  )
}
