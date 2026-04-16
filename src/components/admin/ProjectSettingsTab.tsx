import * as React from "react"

import { useTranslations } from "next-intl"

import { DangerZone } from "@/src/components/admin/DangerZone"

interface ProjectSettingsTabProps {
  projectId: string
  projectName: string
}

export function ProjectSettingsTab({
  projectId,
  projectName,
}: ProjectSettingsTabProps) {
  const t = useTranslations("Admin.projects.details")

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("settings_title", { fallback: "Configurações do Protocolo" })}
          </h3>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/40">
            Gerencie as configurações críticas deste projeto. Tenha cuidado ao
            realizar ações destrutivas, pois elas são permanentes e
            irreversíveis.
          </p>
        </div>

        <DangerZone projectId={projectId} projectName={projectName} />
      </section>
    </div>
  )
}
