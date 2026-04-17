"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Compass,
  Link as LinkIcon,
  Plus,
  Sparkle,
  Target,
  Trash,
  UsersThree,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import {
  savePartialBriefingAction,
  updateProjectBriefingAction,
} from "@/src/lib/actions/project.actions"
import { briefingSchema } from "@/src/lib/validations/project"

interface BriefingFormProps {
  projectId: string
  initialData?: Record<string, unknown> | null
}

const stepsConfig = [
  {
    id: "brandTone",
    icon: Sparkle,
  },
  {
    id: "visualReferences",
    icon: LinkIcon,
  },
  {
    id: "businessGoals",
    icon: Target,
  },
  {
    id: "primaryCta",
    icon: Compass,
  },
  {
    id: "targetAudience",
    icon: UsersThree,
  },
  {
    id: "differentiators",
    icon: Sparkle,
  },
] as const

export function BriefingForm({
  projectId,
  initialData,
}: BriefingFormProps): React.JSX.Element {
  const t = useTranslations("Briefing")
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)

  const initialReferences = Array.isArray(initialData?.visualReferences)
    ? initialData.visualReferences
    : []

  const [formData, setFormData] = React.useState({
    brandTone: (initialData?.brandTone as string) || "",
    visualReferences: (initialReferences.length > 0
      ? initialReferences
      : [""]) as string[],
    businessGoals: (initialData?.businessGoals as string) || "",
    primaryCta: (initialData?.primaryCta as string) || "",
    targetAudience: (initialData?.targetAudience as string) || "",
    differentiators: (initialData?.differentiators as string) || "",
  })

  const currentStepConfig = stepsConfig[step]
  const progress = ((step + 1) / stepsConfig.length) * 100

  const setValue = (value: string | string[]) => {
    setFormData((previous) => ({
      ...previous,
      [currentStepConfig.id]: value,
    }))
  }

  const handleNext = async () => {
    if (step < stepsConfig.length - 1) {
      // Auto-save current field before moving to next step
      const currentField = currentStepConfig.id
      const currentValue = formData[currentField as keyof typeof formData]

      const hasContent = Array.isArray(currentValue)
        ? currentValue.some((v) => v.trim())
        : (currentValue as string).trim()

      if (hasContent) {
        await savePartialBriefingAction(projectId, {
          [currentField]: currentValue,
        })
      }

      setStep((previous) => previous + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((previous) => previous - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    const parsed = briefingSchema.safeParse(formData)

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Briefing inválido")
      setIsLoading(false)
      return
    }

    const result = await updateProjectBriefingAction(projectId, parsed.data)

    if (result.success) {
      toast.success(t("success"))
      setIsFinished(true)
      setTimeout(() => {
        router.refresh()
      }, 1800)
    } else {
      toast.error(result.error ?? "Erro ao enviar briefing")
    }

    setIsLoading(false)
  }

  const addReference = () => {
    setFormData((previous) => ({
      ...previous,
      visualReferences: [...previous.visualReferences, ""],
    }))
  }

  const removeReference = (index: number) => {
    setFormData((previous) => {
      const updated = [...previous.visualReferences]
      updated.splice(index, 1)
      return {
        ...previous,
        visualReferences: updated.length > 0 ? updated : [""],
      }
    })
  }

  const updateReference = (index: number, value: string) => {
    setFormData((previous) => {
      const updated = [...previous.visualReferences]
      updated[index] = value
      return {
        ...previous,
        visualReferences: updated,
      }
    })
  }

  if (isFinished) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 rounded-[2rem] border border-brand-primary/20 bg-[radial-gradient(circle_at_top,rgba(190,242,100,0.16),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-12 text-center shadow-2xl shadow-brand-primary/10 backdrop-blur-xl">
        <div className="flex size-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          <CheckCircle size={42} weight="fill" className="animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-black uppercase tracking-tight">
            {t("success")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("success_description")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="overflow-hidden rounded-[2rem] border border-border/40 bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-2xl shadow-black/5 backdrop-blur-xl md:p-10">
        <header className="border-b border-border/30 pb-8">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">
              {t("onboarding_protocol")}
            </span>
          </div>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground/75">
            {t("description")}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
              {step + 1}/{stepsConfig.length}
            </span>
          </div>
        </header>

        <div className="pt-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-brand-primary/12 text-brand-primary">
              <currentStepConfig.icon size={28} weight="duotone" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/45">
                {t("step_strategy")}
              </p>
              <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight">
                {t(`steps.${currentStepConfig.id}.label`)}
              </h3>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Label
              htmlFor={currentStepConfig.id}
              className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/55"
            >
              {t("answer_label")}
            </Label>

            {currentStepConfig.id === "visualReferences" ? (
              <div className="space-y-3">
                {formData.visualReferences.map((ref, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                        <LinkIcon size={14} />
                      </div>
                      <Input
                        value={ref}
                        onChange={(e) => updateReference(index, e.target.value)}
                        placeholder="https://exemplo.com"
                        className="h-12 rounded-2xl border-border/40 bg-background/40 pl-10 text-sm focus:bg-background/60"
                      />
                    </div>
                    {formData.visualReferences.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReference(index)}
                        className="size-12 shrink-0 rounded-2xl text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash size={18} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addReference}
                  className="h-12 w-full rounded-2xl border-dashed border-border/60 bg-muted/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:bg-brand-primary/5 hover:text-brand-primary hover:border-brand-primary/40"
                >
                  <Plus size={16} className="mr-2" />
                  {t("add_reference")}
                </Button>
              </div>
            ) : (
              <Textarea
                id={currentStepConfig.id}
                value={
                  formData[
                    currentStepConfig.id as keyof typeof formData
                  ] as string
                }
                onChange={(event) => setValue(event.target.value)}
                className="min-h-[220px] rounded-[1.75rem] border-border/40 bg-background/40 p-6 text-base leading-relaxed shadow-inner shadow-black/5 focus:bg-background/60"
                placeholder={t(`steps.${currentStepConfig.id}.placeholder`)}
              />
            )}
          </div>
        </div>

        <footer className="mt-8 flex items-center justify-between border-t border-border/30 pt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0 || isLoading}
            className="rounded-full px-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t("back_button")}
          </Button>

          {step < stepsConfig.length - 1 ? (
            <Button
              onClick={handleNext}
              className="rounded-full bg-brand-primary px-8 text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-brand-primary/20"
            >
              {t("next_step")}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-full bg-brand-primary px-10 text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-brand-primary/20"
            >
              {isLoading ? (
                <CircleNotch size={18} className="mr-2 animate-spin" />
              ) : null}
              {t("submit")}
            </Button>
          )}
        </footer>
      </section>

      <aside className="rounded-[2rem] border border-border/40 bg-muted/10 p-6 backdrop-blur-sm md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
              {t("creative_direction")}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight">
              {t("briefing_map")}
            </h3>
          </div>
          <div className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
            {t("live")}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {stepsConfig.map((item, index) => {
            const isCurrent = index === step
            const isCompleted = index < step

            return (
              <div
                key={item.id}
                className={`rounded-3xl border p-4 transition-all ${
                  isCurrent
                    ? "border-brand-primary/35 bg-brand-primary/8 shadow-lg shadow-brand-primary/5"
                    : isCompleted
                      ? "border-border/30 bg-background/40"
                      : "border-border/20 bg-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl ${
                      isCurrent || isCompleted
                        ? "bg-brand-primary/12 text-brand-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <item.icon size={20} weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/45">
                      {t("step_number", { number: index + 1 })}
                    </p>
                    <h4 className="mt-1 text-sm font-black uppercase tracking-tight text-foreground">
                      {t(`steps.${item.id}.label`)}
                    </h4>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
