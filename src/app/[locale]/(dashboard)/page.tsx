import * as React from "react"

import { getTranslations } from "next-intl/server"

import { UserRole } from "@/src/generated/client/enums"
import { DashboardProject } from "@/src/types/dashboard"
import { auth, currentUser } from "@clerk/nextjs/server"

import { BriefingForm } from "@/src/components/common/BriefingForm"
import { DashboardSummary } from "@/src/components/common/DashboardSummary"
import { Greetings } from "@/src/components/common/Greetings"
import { ProjectSwitcher } from "@/src/components/common/ProjectSwitcher"

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
    const allProjects = await prisma.project.findMany({
      include: {
        client: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    const allUpdates = await prisma.update.findMany({
      include: {
        project: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return (
      <main className="relative flex min-h-svh flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
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
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                {t("active_projects_count", { count: allProjects.length })}
              </p>
            </div>
          </header>

          <DashboardSummary
            project={
              {
                name: t("admin_overview"),
                status: "STRATEGY",
                progress: 0,
                category: "WEB_APP",
                priority: "MEDIUM",
                liveUrl: null,
                repositoryUrl: null,
                briefing: null,
                updates: allUpdates.map((u) => ({
                  ...u,
                  createdAt: u.createdAt.toISOString(),
                })),
                assets: [],
                notifications: [],
                auditLogs: [],
                id: "admin-overview",
                clientId: "admin",
                startDate: new Date(),
                deadline: null,
                budget: null,
                description: t("admin_description"),
                client: {
                  id: "admin",
                  name: "Admin",
                  email: "admin@magui.studio",
                  companyName: "MAGUI.studio",
                  phone: null,
                  position: "Administrator",
                  taxId: null,
                },
              } as unknown as DashboardProject
            }
          />
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
      <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading text-2xl font-black uppercase tracking-tight opacity-20">
          {t("no_project")}
        </h2>
      </main>
    )
  }

  const activeProject = project || projects[0]
  const projectNotifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      projectId: activeProject.id,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  })
  const projectAuditLogs = await prisma.auditLog.findMany({
    where: {
      projectId: activeProject.id,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  })
  const briefingData = activeProject.briefing as Record<string, unknown> | null
  const isBriefingEmpty = !briefingData || Object.keys(briefingData).length < 6 // We have 6 steps in briefingSchema

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
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
                notifications: projectNotifications,
                auditLogs: projectAuditLogs,
                updates: activeProject.updates.map((u) => ({
                  ...u,
                  timezone: "America/Sao_Paulo",
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
