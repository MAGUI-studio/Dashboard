"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import {
  Calendar,
  CurrencyCircleDollar,
  Plus,
  Scales,
  ShieldCheck,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/src/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group"
import { Textarea } from "@/src/components/ui/textarea"

import { registerDecisionAction } from "@/src/lib/actions/communication.actions"

interface DecisionFormProps {
  projectId: string
  threadId?: string
  onSuccess?: () => void
}

export function DecisionForm({
  projectId,
  threadId,
  onSuccess,
}: DecisionFormProps) {
  const t = useTranslations("Communication.decisions")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      projectId,
      threadId: threadId || undefined,
      title: formData.get("title") as string,
      decision: formData.get("decision") as string,
      description: formData.get("description") as string,
      impactScope: formData.get("impactScope") as string,
      impactDeadline: formData.get("impactDeadline") as string,
      impactFinancial: formData.get("impactFinancial") as string,
    }

    try {
      const result = await registerDecisionAction(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Decisão registrada com sucesso")
        onSuccess?.()
        ;(e.target as HTMLFormElement).reset()
      }
    } catch {
      toast.error("Erro ao processar solicitação")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FieldGroup className="gap-8">
        <FieldSet>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("form.title")} <span className="text-red-500">*</span>
              </FieldLabel>
              <InputGroup className="h-12 rounded-full border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <Plus
                    weight="bold"
                    className="size-4 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="title"
                  placeholder={t("form.title_placeholder")}
                  required
                  disabled={isSubmitting}
                  className="font-sans font-bold text-foreground"
                />
              </InputGroup>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("form.decision")} <span className="text-red-500">*</span>
              </FieldLabel>
              <Textarea
                name="decision"
                placeholder={t("form.decision_placeholder")}
                required
                disabled={isSubmitting}
                className="min-h-[100px] rounded-[1.5rem] border-border/40 bg-muted/10 p-6 font-sans font-bold text-foreground focus-visible:ring-1 focus-visible:ring-brand-primary/20"
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("form.description")}
              </FieldLabel>
              <Textarea
                name="description"
                placeholder={t("form.description_placeholder")}
                disabled={isSubmitting}
                className="min-h-[80px] rounded-[1.5rem] border-border/40 bg-muted/10 p-6 font-sans font-bold text-foreground focus-visible:ring-1 focus-visible:ring-brand-primary/20"
              />
            </Field>

            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("form.impact_scope")}
              </FieldLabel>
              <InputGroup className="h-10 rounded-full border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <ShieldCheck
                    weight="bold"
                    className="size-3.5 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="impactScope"
                  placeholder="Ex: -2 telas"
                  disabled={isSubmitting}
                  className="font-sans font-bold text-foreground"
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("form.impact_deadline")}
              </FieldLabel>
              <InputGroup className="h-10 rounded-full border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <Calendar
                    weight="bold"
                    className="size-3.5 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="impactDeadline"
                  placeholder="Ex: +3 dias"
                  disabled={isSubmitting}
                  className="font-sans font-bold text-foreground"
                />
              </InputGroup>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("form.impact_financial")}
              </FieldLabel>
              <InputGroup className="h-10 rounded-full border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <CurrencyCircleDollar
                    weight="bold"
                    className="size-3.5 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="impactFinancial"
                  placeholder="Ex: + R$ 1.200,00"
                  disabled={isSubmitting}
                  className="font-sans font-bold text-foreground"
                />
              </InputGroup>
            </Field>
          </div>
        </FieldSet>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full rounded-full bg-brand-primary text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <>
              <Scales weight="fill" className="mr-2 size-5" />
              {t("form.submit")}
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
