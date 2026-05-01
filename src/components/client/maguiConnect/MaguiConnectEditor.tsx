"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { MaguiConnectProfile } from "@/src/generated/client"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import { upsertOwnMaguiConnectProfileAction } from "@/src/lib/actions/maguiConnect.actions"
import {
  type MaguiConnectProfileInput,
  maguiConnectProfileSchema,
} from "@/src/lib/validations/maguiConnect"

interface MaguiConnectEditorProps {
  initialProfile: MaguiConnectProfile | null
}

export function MaguiConnectEditor({
  initialProfile,
}: MaguiConnectEditorProps) {
  const t = useTranslations("MaguiConnect")
  const [isPending, startTransition] = React.useTransition()

  const [formData, setFormData] = React.useState<MaguiConnectProfileInput>({
    title: initialProfile?.displayName ?? "",
    description: initialProfile?.headline ?? "",
  })

  const handleSave = () => {
    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(formData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error(t("updateFailed"))
      }
    })
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {t("registerEyebrow")}
        </p>
        <h2 className="text-2xl font-black tracking-tight">
          {t("registerTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("registerDescription")}
        </p>
      </div>

      <div className="grid gap-8">
        <div className="grid gap-2">
          <Label
            className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground"
            htmlFor="title"
          >
            {t("titleLabel")}
          </Label>
          <Input
            id="title"
            className="h-14 rounded-none border-0 border-b border-border/70 bg-transparent px-0 text-lg shadow-none placeholder:text-muted-foreground/30 focus-visible:border-foreground focus-visible:ring-0"
            placeholder={t("titlePlaceholder")}
            value={formData.title}
            onChange={(e) =>
              setFormData((current) => ({ ...current, title: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label
            className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground"
            htmlFor="description"
          >
            {t("descriptionLabel")}
          </Label>
          <Textarea
            id="description"
            className="min-h-[180px] rounded-none border-0 border-b border-border/70 bg-transparent px-0 py-2 text-sm leading-relaxed shadow-none placeholder:text-muted-foreground/30 focus-visible:border-foreground focus-visible:ring-0"
            placeholder={t("descriptionPlaceholder")}
            rows={4}
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData((current) => ({
                ...current,
                description: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex justify-start pt-2">
          <Button
            className="rounded-full bg-foreground px-6 text-[11px] font-black uppercase tracking-[0.18em] text-background hover:bg-foreground/90"
            disabled={isPending}
            onClick={handleSave}
          >
            {t("save")}
          </Button>
        </div>
      </div>
    </section>
  )
}
