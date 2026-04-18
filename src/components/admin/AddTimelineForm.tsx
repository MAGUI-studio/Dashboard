"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { CheckCircle, PlusCircle, Spinner, Star } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { InputGroup, InputGroupInput } from "@/src/components/ui/input-group"
import { Switch } from "@/src/components/ui/switch"
import { Textarea } from "@/src/components/ui/textarea"

import { addProjectTimelineAction } from "@/src/lib/actions/project.actions"

interface AddTimelineFormProps {
  projectId: string
}

export function AddTimelineForm({ projectId }: AddTimelineFormProps) {
  const t = useTranslations("Admin.projects.details.timeline_form")
  const [isPending, setIsPending] = React.useState(false)
  const [isMilestone, setIsMilestone] = React.useState(false)
  const [requiresApproval, setRequiresApproval] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    formData.set("projectId", projectId)
    formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)
    formData.set("isMilestone", isMilestone.toString())
    formData.set("requiresApproval", requiresApproval.toString())

    const result = await addProjectTimelineAction(formData)
    if (result.success) {
      toast.success("Evolução registrada com sucesso!")
      formRef.current?.reset()
      setIsMilestone(false)
      setRequiresApproval(false)
    } else {
      toast.error(result.error || "Erro ao registrar evolução")
    }
    setIsPending(false)
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 rounded-3xl border border-border/40 bg-muted/5 p-6 backdrop-blur-sm lg:p-8"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
        Os campos marcados com <span className="text-red-500">*</span> são
        obrigatórios.
      </p>

      <FieldGroup className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Field className="md:col-span-2">
          <FieldLabel className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("title")} <span className="text-red-500">*</span>
          </FieldLabel>
          <InputGroup className="h-14 rounded-2xl border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
            <InputGroupInput
              name="title"
              placeholder={t("title_placeholder")}
              required
              className="px-6 font-bold text-foreground"
            />
          </InputGroup>
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("description")}
          </FieldLabel>
          <Textarea
            name="description"
            placeholder={t("description_placeholder")}
            className="min-h-[120px] rounded-2xl border-border/40 bg-muted/10 px-6 py-4 font-medium text-foreground transition-all focus:bg-muted/20"
          />
        </Field>

        <Field>
          <label
            htmlFor="isMilestone"
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-6 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 cursor-pointer group/milestone"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 select-none group-hover/milestone:text-brand-primary transition-colors">
                <Star
                  weight={isMilestone ? "fill" : "bold"}
                  className={
                    isMilestone
                      ? "text-brand-primary"
                      : "text-muted-foreground/40 group-hover/milestone:text-brand-primary/60"
                  }
                />
                {t("is_milestone")}
              </div>
              <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/30 group-hover/milestone:text-brand-primary/40 transition-colors">
                Destaque este evento como um marco importante no projeto
              </p>
            </div>
            <Switch
              id="isMilestone"
              checked={isMilestone}
              onCheckedChange={setIsMilestone}
              className="data-checked:bg-brand-primary shadow-sm"
            />
          </label>
        </Field>

        <Field>
          <label
            htmlFor="requiresApproval"
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-6 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 cursor-pointer group/approval"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 select-none group-hover/approval:text-brand-primary transition-colors">
                <CheckCircle
                  weight={requiresApproval ? "fill" : "bold"}
                  className={
                    requiresApproval
                      ? "text-brand-primary"
                      : "text-muted-foreground/40 group-hover/approval:text-brand-primary/60"
                  }
                />
                {t("requires_approval")}
              </div>
              <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/30 group-hover/approval:text-brand-primary/40 transition-colors">
                {t("requires_approval_desc")}
              </p>
            </div>
            <Switch
              id="requiresApproval"
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
              className="data-checked:bg-brand-primary shadow-sm"
            />
          </label>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-2xl font-sans font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] md:w-max md:px-12 shadow-lg shadow-brand-primary/10"
      >
        {isPending ? (
          <Spinner className="size-5 animate-spin" />
        ) : (
          <div className="flex items-center gap-3">
            <PlusCircle weight="bold" className="size-5" />
            <span>{t("submit")}</span>
          </div>
        )}
      </Button>
    </form>
  )
}
