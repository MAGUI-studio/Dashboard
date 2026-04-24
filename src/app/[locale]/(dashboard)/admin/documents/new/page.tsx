import * as React from "react"

import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { DocumentForm } from "@/src/components/admin/documents/DocumentForm"

import { getAdminClientOptions } from "@/src/lib/client-data"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata() {
  return dashboardMetadata({
    title: "Novo Documento",
    description: "Crie um novo contrato ou documento oficial.",
    path: "/admin/documents/new",
  })
}

export default async function NewDocumentPage() {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const [clients, projects] = await Promise.all([
    getAdminClientOptions(),
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        client: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const t = await getTranslations("Sidebar.documents")

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <header className="space-y-1">
        <h1 className="font-heading text-4xl font-black uppercase tracking-tight lg:text-5xl">
          {t("create")}
        </h1>
        <p className="text-sm font-medium text-muted-foreground/60">
          Preencha os dados abaixo para gerar um novo documento estruturado.
        </p>
      </header>

      <DocumentForm
        clients={clients}
        projects={
          projects as Array<{
            id: string
            name: string
            client: { name: string | null }
          }>
        }
      />
    </main>
  )
}
