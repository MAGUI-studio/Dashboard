import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetManagement } from "@/src/components/admin/AssetManagement"

interface Asset {
  id: string
  name: string
  url: string
  key: string
  type: string
  order: number
  timezone: string
  createdAt: Date
}

interface ProjectAssetsTabProps {
  projectId: string
  assets: Asset[]
}

export function ProjectAssetsTab({ projectId, assets }: ProjectAssetsTabProps) {
  const t = useTranslations("Admin.projects.details")

  return (
    <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
      <h3 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
        {t("assets_manage_button")}
      </h3>
      <AssetManagement projectId={projectId} assets={assets} />
    </section>
  )
}
