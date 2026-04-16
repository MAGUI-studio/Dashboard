"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { PlusCircle, Spinner } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { InputGroup, InputGroupInput } from "@/src/components/ui/input-group"
import { Textarea } from "@/src/components/ui/textarea"

import { addProjectTimelineAction } from "@/src/lib/actions/project.actions"

interface AddTimelineFormProps {
  projectId: string
}

export function AddTimelineForm({ projectId }: AddTimelineFormProps) {
  const t = useTranslations("Admin.projects.details.timeline_form")
  const [isPending, setIsPending] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    formData.set("projectId", projectId)
    formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)

    const isMilestone = (
      e.currentTarget.elements.namedItem("isMilestone") as HTMLInputElement
    ).checked
    formData.set("isMilestone", isMilestone.toString())

    const result = await addProjectTimelineAction(formData)
    if (result.success) {
      formRef.current?.reset()
    }
    setIsPending(false)
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-muted/5 p-6 backdrop-blur-sm"
    >
      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("title")}
          </FieldLabel>
          <InputGroup className="h-12 rounded-xl border-border/40 bg-muted/10">
            <InputGroupInput
              name="title"
              placeholder={t("title_placeholder")}
              required
              className="font-bold text-foreground"
            />
          </InputGroup>
        </Field>

        <Field className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            name="isMilestone"
            id="isMilestone"
            className="size-4 rounded border-border/40 bg-muted/10 text-brand-primary"
          />
          <label
            htmlFor="isMilestone"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 cursor-pointer"
          >
            {t("is_milestone")}
          </label>
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("description")}
          </FieldLabel>
          <Textarea
            name="description"
            placeholder={t("description_placeholder")}
            className="min-h-[100px] rounded-xl border-border/40 bg-muted/10 font-medium text-foreground"
          />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl font-sans font-black uppercase tracking-widest transition-all md:w-max md:px-8"
      >
        {isPending ? (
          <Spinner className="size-4 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <PlusCircle weight="bold" className="size-5" />
            <span>{t("submit")}</span>
          </div>
        )}
      </Button>
    </form>
  )
}
