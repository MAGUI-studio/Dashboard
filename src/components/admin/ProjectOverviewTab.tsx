import * as React from "react"

import { useTranslations } from "next-intl"

interface ProjectOverviewTabProps {
  project: {
    client: {
      name: string | null
      email: string
    }
    description: string | null
  }
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const t = useTranslations("Admin.projects.details")

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm lg:p-12">
          <h3 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("project_info_title", { fallback: "Informações do Projeto" })}
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {t("project_description_label", {
                  fallback: "Descrição do Escopo",
                })}
              </span>
              <p className="font-sans text-base font-medium leading-relaxed text-foreground/80">
                {project.description ||
                  t("no_description", { fallback: "Sem descrição detalhada." })}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-8">
        <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
          <h3 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("client_card_title")}
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {t("client_name_label")}
              </span>
              <span className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
                {project.client.name || t("not_available")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {t("client_email_label")}
              </span>
              <span className="font-mono text-sm font-bold text-brand-primary">
                {project.client.email}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
