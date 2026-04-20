import * as React from "react"

import { getTranslations } from "next-intl/server"

import {
  ApprovalStatus,
  LeadStatus,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client/enums"
import { DashboardProject } from "@/src/types/dashboard"
import { Link } from "@/src/i18n/navigation"
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

import { BriefingForm } from "@/src/components/common/BriefingForm"
import { DashboardSummary } from "@/src/components/common/DashboardSummary"
import { Greetings } from "@/src/components/common/Greetings"
import { ProjectSwitcher } from "@/src/components/common/ProjectSwitcher"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import prisma from "@/src/lib/prisma"

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

  const isAdmin = user?.role === UserRole.ADMIN

  if (isAdmin) {
    const [
      allProjects,
      pendingApprovals,
      recentUpdates,
      recentLeads,
      totalClients,
      unreadNotifications,
    ] = await Promise.all([
      prisma.project.findMany({
        include: {
          client: true,
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
      prisma.lead.findMany({
        where: {
          status: {
            not: LeadStatus.DESCARTADO,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
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
    ])

    const activeProjects = allProjects.filter(
      (project) => project.status !== ProjectStatus.LAUNCHED
    )
    const activeLeads = recentLeads.filter(
      (lead) => lead.status !== LeadStatus.CONVERTIDO
    )
    const convertedProjects = allProjects.filter(
      (project) => project.status === ProjectStatus.LAUNCHED
    )

    return (
      <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
        <div className="flex flex-col gap-10 w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-brand-primary animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                  {t("admin_eyebrow")}
                </p>
              </div>
              <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
                {t("admin_title")}
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75">
                Painel diario para acompanhar operacao, aprovacoes, comercial e execucao sem precisar abrir cada modulo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]">
                <Link href="/admin/projects">Projetos</Link>
              </Button>
              <Button asChild className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]">
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

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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
                      <Button asChild variant="outline" className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]">
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
                        Atualizado em {new Date(lead.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))
                )}
                <Button asChild variant="outline" className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]">
                  <Link href="/admin/crm">
                    Abrir Comercial
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
                  <div key={project.id} className="flex items-center justify-between gap-4 border-b border-border/15 pb-4 last:border-b-0 last:pb-0">
                    <div className="grid gap-1">
                      <p className="text-sm font-black uppercase tracking-tight text-foreground">
                        {project.name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                        {project.client.name || project.client.email} • {project.status}
                      </p>
                    </div>
                    <span className="text-sm font-black text-foreground/75">
                      {project.progress}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                        <CheckCircle className="size-5 text-emerald-500" weight="fill" />
                      ) : (
                        <NotePencil className="size-5 text-brand-primary" weight="duotone" />
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground/75">
                      {update.description || "Sem descricao detalhada para esta atualizacao."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    )
  }

  const userWithProjects = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      projects: {
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
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  const clerkUser = await currentUser()
  const userName = clerkUser?.firstName || clerkUser?.username || user.name

  const projects = userWithProjects?.projects || []
  const project = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : projects[0]

  if (projects.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading text-2xl font-black uppercase tracking-tight opacity-20">
          {t("no_project")}
        </h2>
      </main>
    )
  }

  const activeProject = project || projects[0]
  const briefingData = activeProject.briefing as Record<string, unknown> | null
  const isBriefingEmpty = !briefingData || Object.keys(briefingData).length < 6 // We have 6 steps in briefingSchema

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="flex flex-col gap-10 w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-1.5 rounded-full bg-brand-primary animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                {t("eyebrow")}
                <span className="opacity-30">•</span>
                <Greetings name={userName} compact />
              </p>
            </div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
              {activeProject.name}
            </h1>
          </div>

          {projects.length > 1 && (
            <div className="flex flex-col gap-1.5 md:items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                {t("select_project")}
              </span>
              <ProjectSwitcher
                projects={projects}
                activeId={activeProject.id}
              />
            </div>
          )}
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
                updates: activeProject.updates.map((u) => ({
                  ...u,
                  createdAt: u.createdAt.toISOString(),
                })),
              } as unknown as DashboardProject
            }
          />
        )}
      </div>
    </main>
  )
}
