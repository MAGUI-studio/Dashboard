import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientAssetLibrary } from "@/src/components/client/ClientAssetLibrary"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Arquivos do projeto",
  description: "Biblioteca autenticada de arquivos e materiais do projeto.",
  path: "/projects",
})

export default async function FilesPage({
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
          Biblioteca de Arquivos
        </h1>
      </header>

      <ClientAssetLibrary assets={project.assets} />
    </div>
  )
}
