import * as React from "react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/src/lib/prisma"
import { getClientProjectById } from "@/src/lib/client-projects"
import { DashboardSummary } from "@/src/components/common/DashboardSummary"
import { DashboardProject } from "@/src/types/dashboard"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectById(id, user.id)

  if (!project) {
    return notFound()
  }

  // Temporary reuse DashboardSummary until detail pages are built
  return (
    <div className="flex w-full flex-col gap-10">
      <header className="flex flex-col gap-2 border-b border-border/20 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
          <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            PROJETOS <span className="opacity-30">/</span> {project.name}
          </p>
        </div>
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
          Visão Geral
        </h1>
      </header>

      <DashboardSummary
        project={
          {
            ...project,
            assets: project.assets.map((asset) => ({
              ...asset,
              timezone: "America/Sao_Paulo",
            })),
            updates: project.updates.map((update) => ({
              ...update,
              createdAt: update.createdAt.toISOString(),
            })),
          } as unknown as DashboardProject
        }
      />
    </div>
  )
}
