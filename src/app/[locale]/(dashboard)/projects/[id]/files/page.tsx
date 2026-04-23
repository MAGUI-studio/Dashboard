import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientAssetLibrary } from "@/src/components/client/ClientAssetLibrary"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientProjectFiles } from "@/src/lib/client-projects"
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

  const project = await getClientProjectFiles(id, user.id)

  if (!project) return notFound()

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / Materiais`}
        title="Materiais e entregas"
        description="Tudo que foi enviado para voce fica organizado aqui: documentos, imagens, arquivos finais e referencias."
      />

      <ClientAssetLibrary assets={project.assets} />
    </div>
  )
}
