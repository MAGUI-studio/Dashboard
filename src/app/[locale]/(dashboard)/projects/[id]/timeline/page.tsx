import * as React from "react"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/src/lib/prisma"
import { getClientProjectById } from "@/src/lib/client-projects"
import { ClientTimeline } from "@/src/components/client/ClientTimeline"

export default async function TimelinePage({
  params,
}: {
  params: any
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
    <div className="flex w-full flex-col gap-10">
      <header className="flex flex-col gap-2 border-b border-border/20 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
          <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            PROJETOS <span className="opacity-30">/</span> {project.name}
          </p>
        </div>
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
          Timeline de Evolução
        </h1>
      </header>

      <ClientTimeline projectId={id} updates={project.updates as any} />
    </div>
  )
}
