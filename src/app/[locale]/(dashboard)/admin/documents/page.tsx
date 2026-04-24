import * as React from "react"

import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { Files, Plus } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { DocumentsTable } from "@/src/components/admin/documents/DocumentsTable"

import { getDocumentsCached } from "@/src/lib/document-data"
import { isAdmin } from "@/src/lib/permissions"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata() {
  return dashboardMetadata({
    title: "Documentos e Contratos",
    description: "Gerenciamento de contratos, NDAs e documentos oficiais.",
    path: "/admin/documents",
  })
}

export default async function AdminDocumentsPage() {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const documents = await getDocumentsCached()
  const t = await getTranslations("Sidebar.documents")

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-primary">
            <Files weight="fill" className="size-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Gestão Jurídica
            </span>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight lg:text-5xl">
            {t("title")}
          </h1>
          <p className="text-sm font-medium text-muted-foreground/60">
            Controle e monitore contratos, NDAs e assinaturas digitais.
          </p>
        </div>

        <Button
          asChild
          className="h-14 rounded-full px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href="/admin/documents/new">
            <Plus weight="bold" className="mr-2 size-5" />
            {t("create")}
          </Link>
        </Button>
      </header>

      <section className="rounded-[2.5rem] border border-border/40 bg-background/40 p-2 shadow-sm backdrop-blur-sm">
        <DocumentsTable documents={documents} />
      </section>
    </main>
  )
}
