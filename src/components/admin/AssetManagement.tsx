"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetType } from "@/src/generated/prisma"
import { File, Trash } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

import {
  createProjectAssetAction,
  deleteProjectAssetAction,
} from "@/src/lib/actions/project.actions"
import { UploadButton } from "@/src/lib/uploadthing"

interface AssetManagementProps {
  projectId: string
  assets: Array<{
    id: string
    name: string
    url: string
    key: string
    type: string
  }>
}

export function AssetManagement({ projectId, assets }: AssetManagementProps) {
  const t = useTranslations("Admin.projects.details")
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    await deleteProjectAssetAction(id, projectId)
    setIsDeleting(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {assets.length === 0 ? (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
            {t("no_assets")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-background/50 p-3 transition-colors hover:bg-muted/5"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <File weight="duotone" className="size-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-[11px] font-bold uppercase tracking-tight text-foreground hover:text-brand-primary"
                    >
                      {asset.name}
                    </a>
                    <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                      {asset.type}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(asset.id)}
                  disabled={isDeleting === asset.id}
                  className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash weight="bold" className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border/60 p-6 text-center transition-colors hover:border-brand-primary/40">
        <UploadButton
          endpoint="projectAsset"
          onClientUploadComplete={async (res) => {
            if (res) {
              for (const file of res) {
                await createProjectAssetAction({
                  projectId,
                  name: file.name,
                  url: file.url,
                  key: file.key,
                  type: "DOCUMENT" as AssetType, // Default to document for now
                })
              }
            }
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`)
          }}
          appearance={{
            button:
              "bg-brand-primary hover:bg-brand-primary/90 text-white font-sans font-black uppercase tracking-widest text-[10px] h-12 rounded-xl w-full",
            allowedContent: "hidden",
          }}
          content={{
            button({ ready }) {
              if (ready) return t("upload_button")
              return t("uploading")
            },
          }}
        />
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
          {t("upload_hint")}
        </p>
      </div>
    </div>
  )
}
