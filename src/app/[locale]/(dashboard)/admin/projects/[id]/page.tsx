import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { AddTimelineForm } from "@/src/components/admin/AddTimelineForm"
import { AssetManagement } from "@/src/components/admin/AssetManagement"
import { ProjectDetailsHeader } from "@/src/components/admin/ProjectDetailsHeader"
import { UpdateStatusForm } from "@/src/components/admin/UpdateStatusForm"

import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

interface ProjectPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function AdminProjectDetailPage({
  params,
}: ProjectPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params
  const t = await getTranslations("Admin.projects.details")

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      updates: {
        orderBy: { createdAt: "desc" },
      },
      assets: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <main className="relative flex min-h-svh flex-col gap-10 bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <ProjectDetailsHeader project={project} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Status & Progress Management */}
          <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("management_title")}
            </h3>
            <UpdateStatusForm
              projectId={project.id}
              currentStatus={project.status}
              currentProgress={project.progress}
            />
          </section>

          {/* Timeline Updates */}
          <section className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("timeline_title")}
              </h3>
            </div>
            <AddTimelineForm projectId={project.id} />

            <div className="flex flex-col gap-0 border-l border-border/40 ml-4">
              {project.updates.map((update) => (
                <div key={update.id} className="relative pl-10 pb-12 last:pb-0">
                  <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-background bg-muted-foreground/40" />
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Sao_Paulo",
                      }).format(new Date(update.createdAt))}{" "}
                      BRT
                    </span>
                    <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                      {update.title}
                    </h4>
                    {update.description && (
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground/60">
                        {update.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          {/* Client Info Card */}
          <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("client_card_title")}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {t("client_name_label")}
                </span>
                <span className="font-bold text-foreground">
                  {project.client.name || t("not_available")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {t("client_email_label")}
                </span>
                <span className="font-bold text-foreground">
                  {project.client.email}
                </span>
              </div>
            </div>
          </section>

          {/* Assets Management */}
          <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("assets_title")}
            </h3>
            <AssetManagement projectId={project.id} assets={project.assets} />
          </section>
        </div>
      </div>
    </main>
  )
}
