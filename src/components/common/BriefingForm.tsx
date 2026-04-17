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
import { parseAsString, useQueryState } from "nuqs"
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

type StepId = (typeof stepsConfig)[number]["id"]

export function BriefingForm({
  projectId,
  initialData,
}: BriefingFormProps): React.JSX.Element {
  const t = useTranslations("Briefing")
  const router = useRouter()

  const idToSlug = React.useMemo(() => {
    return Object.fromEntries(
      stepsConfig.map((s) => [s.id, t(`steps.${s.id}.slug`)])
    ) as Record<StepId, string>
  }, [t])

  const slugToId = React.useMemo(() => {
    return Object.fromEntries(
      stepsConfig.map((s) => [t(`steps.${s.id}.slug`), s.id])
    ) as Record<string, StepId>
  }, [t])

  const [currentSlug, setCurrentSlug] = useQueryState(
    "step",
    parseAsString.withDefault(idToSlug[stepsConfig[0].id])
  )

  const currentStepId = React.useMemo(() => {
    return slugToId[currentSlug] || stepsConfig[0].id
  }, [currentSlug, slugToId])

  const currentStepIndex = React.useMemo(() => {
    const index = stepsConfig.findIndex((s) => s.id === currentStepId)
    return index === -1 ? 0 : index
  }, [currentStepId])

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

  const currentStepConfig = stepsConfig[currentStepIndex]
  const progress = ((currentStepIndex + 1) / stepsConfig.length) * 100

  const setValue = (value: string | string[]) => {
    setFormData((previous) => ({
      ...previous,
      [currentStepConfig.id]: value,
    }))
  }

  const saveCurrentStep = async () => {
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
  }

  const handleNext = async () => {
    if (currentStepIndex < stepsConfig.length - 1) {
      await saveCurrentStep()
      const nextId = stepsConfig[currentStepIndex + 1].id
      setCurrentSlug(idToSlug[nextId])
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevId = stepsConfig[currentStepIndex - 1].id
      setCurrentSlug(idToSlug[prevId])
    }
  }

  const onStepClick = async (id: StepId) => {
    if (id === currentStepId) return
    await saveCurrentStep()
    setCurrentSlug(idToSlug[id])
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
      <div className="flex w-full flex-col items-center justify-center gap-8 rounded-4xl border border-brand-primary/20 bg-background/40 p-20 text-center shadow-2xl shadow-black/5 backdrop-blur-xl">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-brand-primary/20 blur-2xl animate-pulse" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
            <CheckCircle size={56} weight="fill" />
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground">
            {t("success")}
          </h2>
          <p className="text-base text-muted-foreground/70">
            {t("success_description")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative overflow-hidden rounded-4xl border border-border/30 bg-background/20 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl md:p-14">
        {/* Visual Decoration */}
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -left-10 bottom-20 size-64 rounded-full bg-brand-primary/3 blur-3xl" />

        <header className="relative z-10 space-y-8 pb-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-brand-primary/30" />
            <span className="font-decorative text-[10px] font-bold uppercase tracking-[0.5em] text-brand-primary">
              {t("onboarding_protocol")}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
                {t("title")}
              </h2>
              <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-muted-foreground/60">
                {t("description")}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                Processo Estratégico
              </span>
              <div className="flex h-1.5 w-32 overflow-hidden rounded-full bg-muted/30">
                <div
                  className="h-full rounded-full bg-brand-primary transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                {Math.round(progress)}% completo
              </span>
            </div>
          </div>
        </header>

        <div className="relative z-10">
          <div className="mb-10 flex items-start gap-6">
            <div className="relative">
              <div className="absolute inset-0 scale-125 rounded-3xl bg-brand-primary/10 blur-xl transition-all" />
              <div className="relative flex size-20 items-center justify-center rounded-3xl border border-brand-primary/20 bg-background/50 text-brand-primary shadow-lg">
                <currentStepConfig.icon size={36} weight="duotone" />
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-brand-primary/40">
                  {String(currentStepIndex + 1).padStart(2, "0")}
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                  {t("step_strategy")}
                </p>
              </div>
              <h3 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                {t(`steps.${currentStepConfig.id}.label`)}
              </h3>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
            <Label
              htmlFor={currentStepConfig.id}
              className="mb-5 block font-decorative text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40"
            >
              {t("answer_label")}
            </Label>

            {currentStepConfig.id === "visualReferences" ? (
              <div className="space-y-4">
                {formData.visualReferences.map((ref, index) => (
                  <div key={index} className="group flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-colors group-focus-within:text-brand-primary">
                        <LinkIcon size={16} weight="bold" />
                      </div>
                      <Input
                        value={ref}
                        onChange={(e) => updateReference(index, e.target.value)}
                        placeholder="https://exemplo.com"
                        className="h-14 rounded-2xl border-border/40 bg-background/40 pl-12 text-sm transition-all focus:border-brand-primary/30 focus:bg-background/60 focus:ring-0"
                      />
                    </div>
                    {formData.visualReferences.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReference(index)}
                        className="size-14 shrink-0 rounded-2xl border border-transparent text-muted-foreground/30 hover:border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                      >
                        <Trash size={20} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addReference}
                  className="group h-14 w-full rounded-2xl border-dashed border-border/60 bg-muted/5 font-decorative text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-brand-primary"
                >
                  <Plus
                    size={16}
                    className="mr-2 transition-transform group-hover:rotate-90"
                  />
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
                className="min-h-[240px] rounded-4xl border-border/40 bg-background/40 p-8 text-base leading-relaxed shadow-inner shadow-black/5 transition-all focus:border-brand-primary/30 focus:bg-background/60 focus:ring-0"
                placeholder={t(`steps.${currentStepConfig.id}.placeholder`)}
              />
            )}
          </div>
        </div>

        <footer className="relative z-10 mt-12 flex items-center justify-between border-t border-border/30 pt-10">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
            className="h-12 rounded-full px-8 font-decorative text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t("back_button")}
          </Button>

          {currentStepIndex < stepsConfig.length - 1 ? (
            <Button
              onClick={handleNext}
              className="h-12 rounded-full bg-brand-primary px-10 font-decorative text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {t("next_step")}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-12 rounded-full bg-brand-primary px-12 font-decorative text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <CircleNotch size={18} className="mr-2 animate-spin" />
              ) : null}
              {t("submit")}
            </Button>
          )}
        </footer>
      </section>

      <aside className="flex flex-col gap-8">
        <div className="rounded-4xl border border-border/30 bg-background/30 p-8 backdrop-blur-xl shadow-2xl shadow-black/5">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <p className="font-decorative text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">
                {t("creative_direction")}
              </p>
              <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                {t("briefing_map")}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/5 text-brand-primary">
              <Sparkle weight="fill" size={20} className="animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            {stepsConfig.map((item, index) => {
              const isCurrent = item.id === currentStepId
              const isCompleted = currentStepIndex > index

              return (
                <button
                  key={item.id}
                  onClick={() => onStepClick(item.id)}
                  className={`group w-full overflow-hidden rounded-3xl border p-5 transition-all ${
                    isCurrent
                      ? "border-brand-primary/30 bg-background shadow-xl shadow-black/5"
                      : isCompleted
                        ? "border-border/30 bg-background/20 opacity-60"
                        : "border-transparent bg-transparent hover:bg-muted/10 opacity-40 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`flex size-12 items-center justify-center rounded-2xl transition-all duration-500 ${
                        isCurrent || isCompleted
                          ? "bg-brand-primary/10 text-brand-primary scale-110"
                          : "bg-muted/30 text-muted-foreground/30"
                      }`}
                    >
                      <item.icon
                        size={24}
                        weight={isCurrent ? "fill" : "duotone"}
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-mono text-[9px] font-bold uppercase tracking-[0.2em] ${isCurrent ? "text-brand-primary" : "text-muted-foreground/40"}`}
                        >
                          Fase {index + 1}
                        </p>
                        {isCompleted && (
                          <CheckCircle
                            size={14}
                            weight="fill"
                            className="text-brand-primary"
                          />
                        )}
                      </div>
                      <h4
                        className={`mt-1 truncate text-[13px] font-black uppercase tracking-tight transition-colors ${isCurrent ? "text-foreground" : "text-muted-foreground/60"}`}
                      >
                        {t(`steps.${item.id}.label`)}
                      </h4>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Studio DNA Quote */}
        <div className="relative overflow-hidden rounded-4xl border border-border/20 bg-muted/5 p-10">
          <div className="relative z-10">
            <p className="font-decorative text-[10px] font-bold uppercase tracking-[0.6em] text-brand-primary opacity-50">
              Padrão MAGUI
            </p>
            <blockquote className="mt-4 font-heading text-xl font-light italic leading-relaxed text-muted-foreground/70">
              &quot;A excelência não é um ato, mas um hábito enraizado no rigor
              técnico.&quot;
            </blockquote>
          </div>
          <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-brand-primary/5 select-none pointer-events-none uppercase">
            Studio
          </div>
        </div>
      </aside>
    </div>
  )
}
