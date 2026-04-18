"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardProject } from "@/src/types/dashboard"
import { LinkSimple, NoteBlank, Target } from "@phosphor-icons/react"

interface ProjectBriefingTabProps {
  briefing: DashboardProject["briefing"]
}

const briefingFields = [
  { id: "brandTone", type: "text" },
  { id: "visualReferences", type: "links" },
  { id: "businessGoals", type: "text" },
  { id: "primaryCta", type: "text" },
  { id: "targetAudience", type: "text" },
  { id: "differentiators", type: "text" },
] as const

export function ProjectBriefingTab({
  briefing,
}: ProjectBriefingTabProps): React.JSX.Element {
  const t = useTranslations("Briefing")
  const tAdmin = useTranslations("Admin.projects.details")

  const hasBriefing =
    briefing &&
    Object.values(briefing).some((value) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    )

  if (!hasBriefing) {
    return (
      <section className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/5 p-10 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <NoteBlank weight="duotone" className="size-8" />
        </div>
        <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
          {tAdmin("briefing_empty_title", { fallback: "Sem briefing enviado" })}
        </h3>
        <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/60">
          {tAdmin("briefing_empty_description", {
            fallback:
              "Quando o cliente concluir o briefing, as respostas aparecerão aqui para consulta do time.",
          })}
        </p>
      </section>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {briefingFields.map((field) => {
        const value = briefing?.[field.id]

        if (field.type === "links") {
          const links = Array.isArray(value)
            ? value.filter((item): item is string => Boolean(item))
            : []

          return (
            <section
              key={field.id}
              className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm lg:col-span-2"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <LinkSimple weight="duotone" className="size-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                    {t(`steps.${field.id}.label`)}
                  </h3>
                </div>
              </div>

              {links.length > 0 ? (
                <div className="grid gap-3">
                  {links.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-border/30 bg-background/40 px-5 py-4 text-sm font-bold text-brand-primary transition-all hover:border-brand-primary/30 hover:bg-brand-primary/5"
                    >
                      <span className="block truncate">{link}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground/40">
                  {tAdmin("briefing_not_answered", {
                    fallback: "Sem resposta registrada.",
                  })}
                </p>
              )}
            </section>
          )
        }

        return (
          <section
            key={field.id}
            className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Target weight="duotone" className="size-5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  {t(`steps.${field.id}.label`)}
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-border/30 bg-background/40 p-5">
              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground/80">
                {typeof value === "string" && value.trim().length > 0
                  ? value
                  : tAdmin("briefing_not_answered", {
                      fallback: "Sem resposta registrada.",
                    })}
              </p>
            </div>
          </section>
        )
      })}
    </div>
  )
}
