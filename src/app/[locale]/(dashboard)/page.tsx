import * as React from "react"

import { getTranslations } from "next-intl/server"

import { auth, currentUser } from "@clerk/nextjs/server"

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

  const isAdmin = user?.role === "ADMIN"

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
        <div className="flex flex-col gap-12 w-full">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                {t("admin_eyebrow")}
              </p>
            </div>
            <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
              {t("admin_title")}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {t("active_projects_count", { count: allProjects.length })}
            </p>
          </div>

          <DashboardSummary
            project={{
              name: "Visão Geral",
              status: "STRATEGY",
              progress: 0,
              category: "ADMIN",
              priority: "MEDIUM",
              liveUrl: null,
              repositoryUrl: null,
              updates: allUpdates.map((u) => ({
                ...u,
                createdAt: u.createdAt.toISOString(),
              })),
              assets: [],
            }}
          />
        </div>
      </main>
    )
  }

  // CLIENT DASHBOARD
  const userWithProjects = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      projects: {
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
            include: { project: true },
          },
          assets: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  const clerkUser = await currentUser()
  const userName = clerkUser?.firstName || clerkUser?.username || user?.name

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

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="flex flex-col gap-12 w-full">
        {/* Header & Project Switcher */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                  {t("eyebrow")}
                </p>
              </div>
              <Greetings name={userName} />
            </div>
            <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl border-l-4 border-brand-primary pl-6">
              {activeProject.name}
            </h1>
          </div>

          {projects.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Selecione o Projeto
              </span>
              <ProjectSwitcher
                projects={projects}
                activeId={activeProject.id}
              />
            </div>
          )}
        </div>

        <DashboardSummary
          project={{
            ...activeProject,
            updates: activeProject.updates.map((u) => ({
              ...u,
              createdAt: u.createdAt.toISOString(),
            })),
          }}
        />
      </div>
    </main>
  )
}
