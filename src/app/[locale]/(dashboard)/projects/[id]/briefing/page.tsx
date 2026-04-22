import * as React from "react"

import { notFound } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { auth } from "@clerk/nextjs/server"
import { NotePencil } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ClientBriefingComplement } from "@/src/components/client/ClientBriefingComplement"
import { ClientBriefingView } from "@/src/components/client/ClientBriefingView"
import { BriefingForm } from "@/src/components/common/BriefingForm"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { toHref } from "@/src/lib/utils/navigation"

export const metadata = dashboardMetadata({
  title: "Briefing do projeto",
  description: "Briefing autenticado, respostas e complementos do projeto.",
  path: "/projects",
})

export default async function BriefingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { mode } = await searchParams
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectById(id, user.id)

  if (!project) return notFound()

  const briefingData = project.briefing as Record<string, unknown> | null
  const isBriefingEmpty = !briefingData || Object.keys(briefingData).length < 6
  const isEditing = mode === "edit" || isBriefingEmpty

  return (
    <div className="flex w-full flex-col gap-10">
      <header className="flex flex-col gap-4 border-b border-border/20 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              PROJETOS <span className="opacity-30">/</span> {project.name}
            </p>
          </div>
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
            Briefing Estratégico
          </h1>
        </div>

        {!isEditing && (
          <Button
            asChild
            variant="outline"
            className="rounded-full border-border/40 text-[10px] font-black uppercase tracking-widest active:scale-95"
          >
            <Link href={toHref(`/projects/${id}/briefing?mode=edit`)}>
              <NotePencil className="mr-2 size-4" weight="duotone" />
              Editar Briefing
            </Link>
          </Button>
        )}
      </header>

      {isEditing ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BriefingForm projectId={id} initialData={briefingData} />
        </div>
      ) : (
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 px-2">
              Estrutura de Negócio
            </h2>
            <ClientBriefingView briefing={briefingData} />
          </div>

          <ClientBriefingComplement
            projectId={id}
            notes={project.briefingNotes}
          />
        </div>
      )}
    </div>
  )
}
