import * as React from "react"

import { getTranslations } from "next-intl/server"

import {
  ApprovalStatus,
  LeadStatus,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client/enums"
import { Link } from "@/src/i18n/navigation"
import { DashboardProject } from "@/src/types/dashboard"
import { auth, currentUser } from "@clerk/nextjs/server"
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  ClockCountdown,
  FolderOpen,
  NotePencil,
  Users,
} from "@phosphor-icons/react/dist/ssr"
import { addDays, isAfter, isBefore, startOfDay } from "date-fns"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import {
  type ActivityKind,
  AdminActivityFeed,
} from "@/src/components/admin/AdminActivityFeed"
import { AdminAttentionPanel } from "@/src/components/admin/AdminAttentionPanel"
import { AdminCommercialHealthList } from "@/src/components/admin/AdminCommercialHealthList"
import { AdminOperationsAgenda } from "@/src/components/admin/AdminOperationsAgenda"
import { AdminOperationsPerformance } from "@/src/components/admin/AdminOperationsPerformance"
import { AdminProjectHealthList } from "@/src/components/admin/AdminProjectHealthList"
import { AdminRemindersCard } from "@/src/components/admin/AdminRemindersCard"
import { AdminTemplateLibrary } from "@/src/components/admin/AdminTemplateLibrary"
import { BriefingForm } from "@/src/components/common/BriefingForm"
import { DashboardSummary } from "@/src/components/common/DashboardSummary"
import { Greetings } from "@/src/components/common/Greetings"
import { ProjectSwitcher } from "@/src/components/common/ProjectSwitcher"

import { getActiveScheduledReminders } from "@/src/lib/operational-reminders"
import prisma from "@/src/lib/prisma"
import { getLeadHealth } from "@/src/lib/utils/lead-health"
import { getProjectHealth } from "@/src/lib/utils/project-health"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard")
  const { userId } = await auth()
  const { project: selectedProjectId } = await searchParams

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    return <div />
  }

  const isAdmin = user.role === UserRole.ADMIN

  if (isAdmin) {
    const today = startOfDay(new Date())
    const nextSevenDays = addDays(today, 7)

    const [
      allProjects,
      pendingApprovals,
      recentUpdates,
      recentAuditLogs,
      allLeads,
      allTemplates,
      totalClients,
      unreadNotifications,
      dueActionItems,
      scheduledReminders,
    ] = await Promise.all([
      prisma.project.findMany({
        include: {
          client: true,
          updates: {
            select: {
              createdAt: true,
              requiresApproval: true,
              approvalStatus: true,
              approvedAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          actionItems: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              status: true,
            },
            orderBy: { dueDate: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.update.findMany({
        where: {
          requiresApproval: true,
          approvalStatus: ApprovalStatus.PENDING,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.update.findMany({
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.auditLog.findMany({
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.lead.findMany({
        where: {
          status: {
            not: LeadStatus.DESCARTADO,
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.messageTemplate.findMany({
        orderBy: [{ scope: "asc" }, { createdAt: "asc" }],
      }),
      prisma.user.count({
        where: {
          role: UserRole.CLIENT,
        },
      }),
      prisma.notification.count({
        where: {
          readAt: null,
        },
      }),
      prisma.actionItem.findMany({
        where: {
          dueDate: {
            not: null,
          },
          status: {
            not: "COMPLETED",
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 12,
      }),
      getActiveScheduledReminders(user.id),
    ])

    const activeProjects = allProjects.filter(
      (project) => project.status !== ProjectStatus.LAUNCHED
    )
    const recentLeads = allLeads.slice(0, 6)
    const activeLeads = allLeads.filter(
      (lead) => lead.status !== LeadStatus.CONVERTIDO
    )
    const convertedProjects = allProjects.filter(
      (project) => project.status === ProjectStatus.LAUNCHED
    )

    const deadlineProjects = activeProjects
      .filter(
        (project) =>
          project.deadline &&
          isAfter(new Date(project.deadline), today) &&
          isBefore(new Date(project.deadline), nextSevenDays)
      )
      .slice(0, 2)

    const stagnantLeads = allLeads
      .filter((lead) => {
        const staleLimit = addDays(startOfDay(new Date(lead.updatedAt)), 4)

        return (
          (lead.status === LeadStatus.GARIMPAGEM ||
            lead.status === LeadStatus.CONTATO_REALIZADO) &&
          isBefore(staleLimit, today)
        )
      })
      .slice(0, 2)

    const projectsNeedingUpdates = activeProjects
      .filter((project) => {
        const lastUpdateAt = project.updates[0]?.createdAt ?? project.updatedAt
        return isBefore(addDays(startOfDay(new Date(lastUpdateAt)), 8), today)
      })
      .slice(0, 2)

    const overdueActionItems = dueActionItems
      .filter((item) => item.dueDate && isBefore(new Date(item.dueDate), today))
      .slice(0, 2)

    const attentionItems = [
      ...pendingApprovals.slice(0, 2).map((approval) => ({
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
      ...deadlineProjects.map((project) => ({
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
      ...stagnantLeads.map((lead) => ({
        id: `lead-${lead.id}`,
        title: `${lead.companyName} sem retorno recente`,
        description: `Lead parado desde ${new Date(lead.updatedAt).toLocaleDateString("pt-BR")} na etapa ${lead.status}.`,
        href: `/admin/crm?lead=${lead.id}`,
        kind: "lead" as const,
        priority: "medium" as const,
      })),
      ...overdueActionItems.map((item) => ({
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
      ...projectsNeedingUpdates.map((project) => ({
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

    const agendaItems = [
      ...deadlineProjects.map((project) => ({
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
      ...dueActionItems
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
      ...allLeads
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
    ].slice(0, 10) // Increased limit to allow filtering to be useful

    const projectHealthItems = activeProjects
      .map((project) => {
        const pendingApprovalCount = project.updates.filter(
          (update) =>
            update.requiresApproval &&
            update.approvalStatus === ApprovalStatus.PENDING
        ).length

        const overdueActionItemCount = project.actionItems.filter(
          (item) =>
            item.status !== "COMPLETED" &&
            item.dueDate &&
            isBefore(new Date(item.dueDate), today)
        ).length

        const health = getProjectHealth({
          status: project.status,
          progress: project.progress,
          deadline: project.deadline,
          updatedAt: project.updatedAt,
          lastUpdateAt: project.updates[0]?.createdAt ?? null,
          pendingApprovalCount,
          overdueActionItemCount,
        })

        return {
          id: project.id,
          name: project.name,
          clientName: project.client.name || project.client.email,
          progress: project.progress,
          ...health,
        }
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    const activityItems = recentAuditLogs.map((log) => {
      const normalizedAction = log.action.toLowerCase()
      const normalizedEntityType = log.entityType.toLowerCase()

      const kind: ActivityKind =
        normalizedAction.includes("approved") ||
        normalizedAction.includes("rejected")
          ? "approval"
          : normalizedEntityType.includes("asset")
            ? "asset"
            : normalizedEntityType.includes("briefing")
              ? "briefing"
              : normalizedEntityType.includes("update")
                ? "timeline"
                : normalizedEntityType.includes("project")
                  ? "project"
                  : "system"

      return {
        id: log.id,
        action: log.action,
        summary: log.summary,
        createdAt: log.createdAt,
        actorName: log.actor?.name ?? null,
        actorRole: log.actor?.role ?? null,
        projectName: log.project?.name ?? null,
        entityType: log.entityType,
        kind,
        href: log.projectId
          ? {
              pathname: "/admin/projects/[id]" as const,
              params: { id: log.projectId },
            }
          : "/admin/projects",
      }
    })

    const commercialHealthItems = allLeads
      .filter((lead) => lead.status !== LeadStatus.CONVERTIDO)
      .map((lead) => {
        const health = getLeadHealth({
          status: lead.status,
          source: lead.source,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          lastContactAt: lead.lastContactAt,
          contactName: lead.contactName,
          email: lead.email,
          phone: lead.phone,
          instagram: lead.instagram,
          website: lead.website,
        })

        return {
          id: lead.id,
          companyName: lead.companyName,
          contactName: lead.contactName,
          statusLabel: lead.status,
          ...health,
        }
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    const approvedUpdates = allProjects.flatMap((project) =>
      project.updates
        .filter(
          (update) =>
            update.requiresApproval &&
            update.approvalStatus === ApprovalStatus.APPROVED &&
            update.approvedAt
        )
        .map((update) => ({
          createdAt: new Date(update.createdAt),
          approvedAt: new Date(update.approvedAt!),
        }))
    )

    const averageApprovalHours =
      approvedUpdates.length > 0
        ? Math.round(
            approvedUpdates.reduce((acc, update) => {
              return (
                acc +
                (update.approvedAt.getTime() - update.createdAt.getTime()) /
                  3_600_000
              )
            }, 0) / approvedUpdates.length
          )
        : 0

    const convertedLeadsMetrics = allLeads.filter((lead) => lead.convertedAt)
    const averageLeadConversionDays =
      convertedLeadsMetrics.length > 0
        ? Math.round(
            convertedLeadsMetrics.reduce((acc, lead) => {
              return (
                acc +
                (new Date(lead.convertedAt!).getTime() -
                  new Date(lead.createdAt).getTime()) /
                  86_400_000
              )
            }, 0) / convertedLeadsMetrics.length
          )
        : 0

    const operationsMetrics = [
      {
        label: "Aprovação média",
        value: averageApprovalHours > 0 ? `${averageApprovalHours}h` : "—",
        hint: "tempo até aprovar entrega",
      },
      {
        label: "Conversão média",
        value:
          averageLeadConversionDays > 0 ? `${averageLeadConversionDays}d` : "—",
        hint: "tempo até virar projeto",
      },
      {
        label: "Projetos ativos",
        value: String(activeProjects.length),
        hint: `${projectsNeedingUpdates.length} sem update recente`,
      },
      {
        label: "Leads estagnados",
        value: String(stagnantLeads.length),
        hint: `${commercialHealthItems.filter((item) => item.tone === "risk").length} em risco`,
      },
    ]

    const projectDistribution = Object.values(ProjectStatus).map((status) => ({
      label: status,
      value: allProjects.filter((project) => project.status === status).length,
    }))

    const leadDistribution = Object.values(LeadStatus)
      .filter((status) => status !== LeadStatus.DESCARTADO)
      .map((status) => ({
        label: status,
        value: allLeads.filter((lead) => lead.status === status).length,
      }))

    const silentProjectItems = activeProjects
      .map((project) => {
        const lastUpdateAt = project.updates[0]?.createdAt ?? project.updatedAt
        const daysWithoutUpdate = Math.floor(
          (today.getTime() - new Date(lastUpdateAt).getTime()) / 86_400_000
        )

        return {
          id: project.id,
          name: project.name,
          clientName: project.client.name || project.client.email,
          daysWithoutUpdate,
        }
      })
      .filter((project) => project.daysWithoutUpdate >= 5)
      .sort((a, b) => b.daysWithoutUpdate - a.daysWithoutUpdate)
      .slice(0, 4)

    return (
      <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
        <div className="flex w-full flex-col gap-10">
          <header className="flex flex-col justify-between gap-6 border-b border-border/20 pb-8 md:flex-row md:items-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
                <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  {t("admin_eyebrow")}
                </p>
              </div>
              <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
                {t("admin_title")}
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75">
                Painel diario para acompanhar operacao, aprovacoes, comercial e
                execucao sem precisar abrir cada modulo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
              >
                <Link href="/admin/projects">Projetos</Link>
              </Button>
              <Button
                asChild
                className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
              >
                <Link href="/admin/crm">Comercial</Link>
              </Button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Clientes ativos",
                value: totalClients,
                hint: "base cadastrada",
                icon: Users,
              },
              {
                label: "Projetos em andamento",
                value: activeProjects.length,
                hint: `${convertedProjects.length} finalizados`,
                icon: FolderOpen,
              },
              {
                label: "Aprovacoes pendentes",
                value: pendingApprovals.length,
                hint: "pedem revisao hoje",
                icon: ClockCountdown,
              },
              {
                label: "Leads em aberto",
                value: activeLeads.length,
                hint: `${unreadNotifications} notificacoes nao lidas`,
                icon: ChartLineUp,
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="rounded-[1.75rem] border-border/40 bg-muted/10 backdrop-blur-md"
              >
                <CardContent className="flex items-start justify-between gap-4 pt-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/50">
                      {item.label}
                    </p>
                    <p className="mt-3 text-4xl font-black tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                      {item.hint}
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <item.icon className="size-6" weight="duotone" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <AdminAttentionPanel items={attentionItems} />
            <AdminOperationsAgenda items={agendaItems} />
          </section>

          <section className="grid gap-6">
            <AdminRemindersCard items={scheduledReminders} />
          </section>

          <section className="grid gap-6">
            <AdminActivityFeed items={activityItems} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <AdminCommercialHealthList items={commercialHealthItems} />
            <AdminOperationsPerformance
              metrics={operationsMetrics}
              projectDistribution={projectDistribution}
              leadDistribution={leadDistribution}
              silentProjects={silentProjectItems}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <AdminProjectHealthList items={projectHealthItems} />

            <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Aprovacoes pendentes
                </CardTitle>
                <CardDescription>
                  Entregas que ainda dependem de validacao ou resposta.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                {pendingApprovals.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                    Nenhuma aprovacao pendente no momento.
                  </div>
                ) : (
                  pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="flex flex-col gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="grid gap-1">
                        <p className="text-base font-black tracking-tight text-foreground">
                          {approval.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                          {approval.project.name}
                        </p>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                      >
                        <Link
                          href={{
                            pathname: "/admin/projects/[id]",
                            params: { id: approval.project.id },
                          }}
                        >
                          Abrir projeto
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Atualizacoes recentes
                </CardTitle>
                <CardDescription>
                  O que mudou mais recentemente nos projetos.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                {recentUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-1">
                        <p className="text-base font-black tracking-tight text-foreground">
                          {update.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                          {update.project.name}
                        </p>
                      </div>
                      {update.approvalStatus === ApprovalStatus.APPROVED ? (
                        <CheckCircle
                          className="size-5 text-emerald-500"
                          weight="fill"
                        />
                      ) : (
                        <NotePencil
                          className="size-5 text-brand-primary"
                          weight="duotone"
                        />
                      )}
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground/75">
                      {update.description ||
                        "Sem descricao detalhada para esta atualizacao."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Action items proximos
                </CardTitle>
                <CardDescription>
                  Tarefas operacionais com prazo mais imediato.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                {dueActionItems.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                    Nenhuma tarefa com prazo definido.
                  </div>
                ) : (
                  dueActionItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
                    >
                      <div className="grid gap-1">
                        <p className="text-base font-black tracking-tight text-foreground">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                          {item.project.name}
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString("pt-BR")
                          : "Sem data"}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Comercial recente
                </CardTitle>
                <CardDescription>
                  Leads mais recentes para abrir o dia com contexto.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                {recentLeads.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                    Nenhum lead cadastrado.
                  </div>
                ) : (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="grid gap-1 rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
                    >
                      <p className="text-base font-black tracking-tight text-foreground">
                        {lead.companyName}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                        {lead.contactName || "Sem contato"} • {lead.status}
                      </p>
                      <p className="text-sm text-muted-foreground/75">
                        Atualizado em{" "}
                        {new Date(lead.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))
                )}

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  <Link href="/admin/crm">
                    Abrir Comercial
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Projetos em andamento
                </CardTitle>
                <CardDescription>
                  Visao rapida dos projetos que precisam de acompanhamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                {activeProjects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-4 border-b border-border/15 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="grid gap-1">
                      <p className="text-sm font-black uppercase tracking-tight text-foreground">
                        {project.name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                        {project.client.name || project.client.email} •{" "}
                        {project.status}
                      </p>
                    </div>
                    <span className="text-sm font-black text-foreground/75">
                      {project.progress}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6">
            <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Biblioteca de templates
                </CardTitle>
                <CardDescription>
                  Mensagens base para comercial, updates, aprovações, material e
                  onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminTemplateLibrary templates={allTemplates as never} />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    )
  }

  const projectsWithAccess = await prisma.project.findMany({
    where: {
      OR: [
        { clientId: user.id },
        {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      ],
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
          position: true,
          taxId: true,
        },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          isMilestone: true,
          imageUrl: true,
          projectId: true,
          createdAt: true,
          requiresApproval: true,
          approvalStatus: true,
          approvedAt: true,
          feedback: true,
          timezone: true,
          attachments: {
            orderBy: { createdAt: "asc" },
          },
          project: {
            select: {
              name: true,
            },
          },
        },
      },
      assets: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          url: true,
          key: true,
          type: true,
          order: true,
          origin: true,
          visibility: true,
          projectId: true,
          createdAt: true,
        },
      },
      actionItems: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          projectId: true,
          targetRole: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      versions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          deployUrl: true,
          description: true,
          scorePerformance: true,
          scoreAccessibility: true,
          scoreBestPractices: true,
          scoreSEO: true,
          projectId: true,
          createdAt: true,
        },
      },
      briefingNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const clerkUser = await currentUser()
  const userName = clerkUser?.firstName || clerkUser?.username || user.name

  const project = selectedProjectId
    ? projectsWithAccess.find((item) => item.id === selectedProjectId)
    : projectsWithAccess[0]

  if (projectsWithAccess.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading text-2xl font-black uppercase tracking-tight opacity-20">
          {t("no_project")}
        </h2>
      </main>
    )
  }

  const activeProject = project || projectsWithAccess[0]
  const briefingData = activeProject.briefing as Record<string, unknown> | null
  const isBriefingEmpty = !briefingData || Object.keys(briefingData).length < 6

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="flex w-full flex-col gap-10">
        <header className="flex flex-col justify-between gap-6 border-b border-border/20 pb-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
              <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("eyebrow")}
                <span className="opacity-30">•</span>
                <Greetings name={userName} compact />
              </p>
            </div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
              {activeProject.name}
            </h1>
          </div>

          {projectsWithAccess.length > 1 ? (
            <div className="flex flex-col gap-1.5 md:items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                {t("select_project")}
              </span>
              <ProjectSwitcher
                projects={projectsWithAccess as unknown as DashboardProject[]}
                selectedProject={activeProject as unknown as DashboardProject}
                onProjectSelect={(id) => {
                  window.location.search = `?project=${id}`
                }}
              />
            </div>
          ) : null}
        </header>

        {isBriefingEmpty ? (
          <BriefingForm
            projectId={activeProject.id}
            initialData={
              activeProject.briefing as Record<string, unknown> | null
            }
          />
        ) : (
          <DashboardSummary
            project={
              {
                ...activeProject,
                assets: activeProject.assets.map((asset) => ({
                  ...asset,
                  timezone: "America/Sao_Paulo",
                })),
                updates: activeProject.updates.map((update) => ({
                  ...update,
                  createdAt: update.createdAt.toISOString(),
                })),
              } as unknown as DashboardProject
            }
          />
        )}
      </div>
    </main>
  )
}
