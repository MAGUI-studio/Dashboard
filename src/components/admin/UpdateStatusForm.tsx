"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { CheckCircle, Gear } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { updateProjectStatusAction } from "@/src/lib/actions/project.actions"

interface UpdateStatusFormProps {
  projectId: string
  currentStatus: string
  currentProgress: number
}

export function UpdateStatusForm({
  projectId,
  currentStatus,
  currentProgress,
}: UpdateStatusFormProps) {
  const t = useTranslations("Admin.projects.details")
  const tStatus = useTranslations("Dashboard.status")
  const [isPending, setIsPending] = React.useState(false)
  const [progress, setProgress] = React.useState(currentProgress)
  const [status, setStatus] = React.useState(currentStatus)

  const handleUpdate = async () => {
    setIsPending(true)
    const formData = new FormData()
    formData.set("id", projectId)
    formData.set("status", status)
    formData.set("progress", progress.toString())

    await updateProjectStatusAction(formData)
    setIsPending(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Field>
          <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("status_label")}
          </FieldLabel>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-14 rounded-2xl border-border/40 bg-muted/10 font-bold uppercase tracking-widest text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
              {[
                "STRATEGY",
                "ARCHITECTURE",
                "DESIGN",
                "ENGINEERING",
                "QA",
                "LAUNCHED",
              ].map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition-colors focus:bg-brand-primary focus:text-white"
                >
                  {tStatus(s as keyof typeof tStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("progress_label")} ({progress}%)
          </FieldLabel>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/30 accent-brand-primary"
            />
          </div>
        </Field>
      </FieldGroup>

      <Button
        onClick={handleUpdate}
        disabled={isPending}
        className="h-14 w-full rounded-2xl font-sans font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] md:w-max md:px-12 shadow-lg shadow-brand-primary/10"
      >
        {isPending ? (
          <div className="flex items-center gap-3">
            <Gear weight="bold" className="size-5 animate-spin" />
            <span>{t("submitting")}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CheckCircle weight="bold" className="size-5" />
            <span>{t("update_status")}</span>
          </div>
        )}
      </Button>
    </div>
  )
}
