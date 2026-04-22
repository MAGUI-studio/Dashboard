import * as React from "react"

import { notFound } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { auth } from "@clerk/nextjs/server"

import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area"

import { ClientProjectSidebar } from "@/src/components/client/ClientProjectSidebar"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { toHref } from "@/src/lib/utils/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  return dashboardMetadata({
    title: project?.name ?? "Projeto",
    description:
      "Area autenticada do projeto com timeline, aprovacoes, arquivos, briefing e tarefas.",
    path: `/projects/${id}`,
  })
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  if (!project) return notFound()

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex w-full flex-col border-b border-border/10 lg:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <nav className="flex items-center gap-1 p-4">
            {[
              { label: "Geral", href: `/projects/${id}` },
              { label: "Timeline", href: `/projects/${id}/timeline` },
              { label: "Validações", href: `/projects/${id}/approvals` },
              { label: "Arquivos", href: `/projects/${id}/files` },
              { label: "Briefing", href: `/projects/${id}/briefing` },
              { label: "Tarefas", href: `/projects/${id}/tasks` },
            ].map((item) => (
              <Link
                key={item.href}
                href={toHref(item.href)}
                className="inline-flex h-9 items-center justify-center rounded-full px-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-all active:scale-95"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="container mx-auto flex flex-col gap-10 lg:flex-row lg:gap-16 lg:py-12">
        <ClientProjectSidebar projectId={id} />
        <div className="w-full min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
