import * as React from "react"

import { notFound, redirect } from "next/navigation"

import { Prisma } from "@/src/generated/client"
import {
  ClockCounterClockwise,
  FileText,
  Signature,
} from "@phosphor-icons/react/dist/ssr"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import { DocumentDetailsHeader } from "@/src/components/admin/documents/DocumentDetailsHeader"
import { DocumentHistory } from "@/src/components/admin/documents/DocumentHistory"
import { DocumentSignersList } from "@/src/components/admin/documents/DocumentSignersList"
import { DocumentViewer } from "@/src/components/admin/documents/DocumentViewer"

import { getDocumentDetailsCached } from "@/src/lib/document-data"
import { isAdmin } from "@/src/lib/permissions"
import { dashboardMetadata } from "@/src/lib/seo"

interface DocumentPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DocumentPageProps) {
  const { id } = await params
  return dashboardMetadata({
    title: "Detalhes do Documento",
    description: "Visualize e gerencie as assinaturas do documento.",
    path: `/admin/documents/${id}`,
  })
}

type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: {
    client: true
    project: true
    lead: true
    clauses: true
    signers: true
    versions: {
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    }
  }
}>

export default async function DocumentDetailPage({
  params,
}: DocumentPageProps) {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params
  const doc = (await getDocumentDetailsCached(
    id
  )) as DocumentWithRelations | null

  if (!doc) {
    notFound()
  }

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <DocumentDetailsHeader document={doc} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="bg-muted/20 p-1 rounded-full border border-border/40 mb-6">
              <TabsTrigger
                value="content"
                className="rounded-full px-6 text-[10px] font-black uppercase tracking-wider"
              >
                <FileText className="mr-2 size-4" /> Conteúdo
              </TabsTrigger>
              <TabsTrigger
                value="signers"
                className="rounded-full px-6 text-[10px] font-black uppercase tracking-wider"
              >
                <Signature className="mr-2 size-4" /> Assinaturas
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-full px-6 text-[10px] font-black uppercase tracking-wider"
              >
                <ClockCounterClockwise className="mr-2 size-4" /> Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 focus-visible:ring-0">
              <DocumentViewer document={doc} />
            </TabsContent>

            <TabsContent value="signers" className="mt-0 focus-visible:ring-0">
              <DocumentSignersList signers={doc.signers} />
            </TabsContent>

            <TabsContent value="history" className="mt-0 focus-visible:ring-0">
              <DocumentHistory versions={doc.versions} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:col-span-4">
          {/* Sidebar with quick info and actions */}
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-brand-primary/5 border border-brand-primary/20 space-y-6">
              <h4 className="font-heading text-lg font-black uppercase tracking-tight">
                Vínculos
              </h4>
              <div className="space-y-4">
                {doc.client && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Cliente
                    </span>
                    <p className="text-sm font-bold uppercase">
                      {doc.client.name}
                    </p>
                  </div>
                )}
                {doc.project && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Projeto
                    </span>
                    <p className="text-sm font-bold uppercase">
                      {doc.project.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
