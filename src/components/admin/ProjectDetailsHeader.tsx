"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowLeft,
  Calendar,
  CurrencyDollar,
  Files,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

interface ProjectDetailsHeaderProps {
  project: {
    id: string
    name: string
    budget: string | null
    deadline: Date | null
  }
}

export function ProjectDetailsHeader({ project }: ProjectDetailsHeaderProps) {
  const t = useTranslations("Admin.projects.details")
  const router = useRouter()

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="-ml-4 w-max gap-2 text-muted-foreground/60 hover:text-foreground"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft weight="bold" className="size-3" />
          {t("back_button")}
        </Button>

        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-6xl">
            {project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <CurrencyDollar
                weight="duotone"
                className="size-4 text-brand-primary"
              />
              {project.budget || t("no_budget")}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <Calendar
                weight="duotone"
                className="size-4 text-brand-primary"
              />
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : t("no_deadline")}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link href={`/admin/projects/${project.id}/assets` as any}>
          <Button className="h-14 rounded-full px-8 font-sans font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
            <Files weight="duotone" className="mr-2 size-5" />
            {t("assets_manage_button")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
