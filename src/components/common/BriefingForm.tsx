"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import {
  savePartialBriefingAction,
  updateProjectBriefingAction,
} from "@/src/lib/actions/project.actions"
import { cn } from "@/src/lib/utils/utils"
import { briefingSchema } from "@/src/lib/validations/project"

interface BriefingFormProps {
  projectId: string
  initialData?: Record<string, unknown> | null
}

const stepsConfig = [
  { id: "brandTone", min: 100 },
  { id: "visualReferences", min: 0 }, // Optional
  { id: "businessGoals", min: 100 },
  { id: "primaryCta", min: 3 }, // Mantendo 3 por ser CTA curto, mas posso subir se desejar
  { id: "targetAudience", min: 100 },
  { id: "differentiators", min: 100 },
] as const

type StepId = (typeof stepsConfig)[number]["id"]

export function BriefingForm({
  projectId,
  initialData,
}: BriefingFormProps): React.JSX.Element {
  const t = useTranslations("Briefing")
  const router = useRouter()
  const inputRef = React.useRef<HTMLTextAreaElement | HTMLInputElement>(null)

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

  const firstMissingStepId = React.useMemo(() => {
    const missing = stepsConfig.find((config) => {
      if (config.min === 0) return false
      const val = initialData?.[config.id]
      return typeof val !== "string" || val.trim().length < config.min
    })
    return missing?.id || stepsConfig[0].id
  }, [initialData])

  const [currentSlug, setCurrentSlug] = useQueryState(
    "step",
    parseAsString.withDefault(idToSlug[firstMissingStepId])
  )

  const currentStepId = React.useMemo(() => {
    return slugToId[currentSlug] || firstMissingStepId
  }, [currentSlug, slugToId, firstMissingStepId])

  const currentStepIndex = React.useMemo(() => {
    const index = stepsConfig.findIndex((s) => s.id === currentStepId)
    return index === -1 ? 0 : index
  }, [currentStepId])

  const [isLoading, setIsLoading] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

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

  const setValue = (value: string | string[]) => {
    setFormData((previous) => ({
      ...previous,
      [currentStepConfig.id]: value,
    }))
  }

  const isFieldMissing = React.useCallback(
    (id: string) => {
      const config = stepsConfig.find((s) => s.id === id)
      if (!config || config.min === 0) return false

      const value = formData[id as keyof typeof formData]
      if (typeof value === "string") {
        return value.trim().length < config.min
      }
      return false
    },
    [formData]
  )

  const canSubmit = React.useMemo(() => {
    return stepsConfig.every((s) => !isFieldMissing(s.id))
  }, [isFieldMissing])

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
    if (!canSubmit) {
      setShowErrors(true)
      const firstMissing = stepsConfig.find((s) => isFieldMissing(s.id))
      if (firstMissing) {
        setCurrentSlug(idToSlug[firstMissing.id])
      }
      toast.error(
        "Por favor, preencha todos os campos obrigatórios com o mínimo de caracteres."
      )
      return
    }

    setIsLoading(true)

    const parsed = briefingSchema.safeParse(formData)

    if (!parsed.success) {
      setShowErrors(true)
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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        currentStepIndex < stepsConfig.length - 1
      ) {
        handleNext()
      } else if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        currentStepIndex === stepsConfig.length - 1
      ) {
        handleSubmit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentStepIndex, formData, canSubmit])

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentStepId, isFinished])

  if (isFinished) {
    return (
      <div className="flex w-full min-h-[60vh] flex-col items-center justify-center gap-8 py-20 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          <CheckCircle size={48} weight="fill" />
        </div>
        <div className="max-w-lg space-y-4">
          <h2 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {t("success")}
          </h2>
          <p className="text-lg text-muted-foreground/60">
            {t("success_description")}
          </p>
        </div>
      </div>
    )
  }

  const currentVal = formData[currentStepId as keyof typeof formData]
  const currentLength =
    typeof currentVal === "string" ? currentVal.trim().length : 0
  const showCounter =
    currentStepConfig.min > 0 && currentLength < currentStepConfig.min

  return (
    <div className="flex flex-col xl:flex-row w-full gap-16 xl:gap-32 py-10">
      <aside className="w-full xl:w-64 shrink-0 flex flex-col gap-12">
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">
            {t("onboarding_protocol")}
          </p>
          <p className="text-xs font-medium text-muted-foreground/50 leading-relaxed">
            {t("description")}
          </p>
        </div>

        <nav className="relative flex flex-col gap-6">
          <div className="absolute left-1.5 top-2 bottom-2 w-[1px] bg-border/40" />

          {stepsConfig.map((item, index) => {
            const isCurrent = item.id === currentStepId
            const isCompleted = currentStepIndex > index
            const isMissing = isFieldMissing(item.id)

            return (
              <button
                key={item.id}
                onClick={() => onStepClick(item.id)}
                className="group relative flex items-center gap-5 text-left transition-all"
              >
                <div
                  className={cn(
                    "relative z-10 flex size-3 items-center justify-center rounded-full transition-all duration-500",
                    isCurrent
                      ? "bg-brand-primary ring-4 ring-brand-primary/20 scale-125"
                      : isCompleted
                        ? "bg-brand-primary"
                        : "bg-muted-foreground/20 group-hover:bg-muted-foreground/40",
                    showErrors &&
                      isMissing &&
                      !isCurrent &&
                      "bg-destructive ring-destructive/20"
                  )}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "font-mono text-[9px] font-bold uppercase tracking-[0.3em] transition-colors duration-500",
                        isCurrent || isCompleted
                          ? "text-brand-primary"
                          : "text-muted-foreground/30 group-hover:text-muted-foreground/50",
                        showErrors &&
                          isMissing &&
                          !isCurrent &&
                          "text-destructive"
                      )}
                    >
                      0{index + 1}
                    </span>
                    {showErrors && isMissing && (
                      <WarningCircle
                        size={14}
                        weight="fill"
                        className="text-destructive animate-pulse"
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-black uppercase tracking-widest transition-colors duration-500 mt-1 truncate",
                      isCurrent
                        ? "text-foreground"
                        : isCompleted
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground/30 group-hover:text-muted-foreground/50",
                      showErrors &&
                        isMissing &&
                        !isCurrent &&
                        "text-destructive/70"
                    )}
                  >
                    {t(`steps.${item.id}.label`)}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 pb-32 xl:pb-0">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out flex-1">
          <div className="mb-12">
            <h2 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground md:text-6xl xl:text-[5rem] xl:leading-[1.1]">
              {t(`steps.${currentStepConfig.id}.label`)}
            </h2>
            <div className="mt-6 flex items-start justify-between gap-8">
              <p className="text-base font-medium md:text-lg text-muted-foreground/60 max-w-2xl leading-relaxed border-l-2 border-brand-primary/30 pl-4">
                {t(`steps.${currentStepConfig.id}.placeholder`)}
              </p>

              {showCounter && (
                <div className="shrink-0 flex flex-col items-end">
                  <span className="font-mono text-[10px] font-bold text-brand-primary tracking-widest">
                    {currentLength}/{currentStepConfig.min}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">
                    mínimo exigido
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            {currentStepConfig.id === "visualReferences" ? (
              <div className="space-y-6">
                {formData.visualReferences.map((ref, index) => (
                  <div key={index} className="group relative flex items-center">
                    <span className="absolute left-0 font-mono text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest select-none">
                      REF
                    </span>
                    <input
                      ref={
                        index === 0
                          ? (inputRef as React.RefObject<HTMLInputElement>)
                          : undefined
                      }
                      type="url"
                      value={ref}
                      onChange={(e) => updateReference(index, e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-transparent border-b border-border/30 pl-12 pr-12 py-6 text-xl text-foreground font-medium transition-all placeholder:text-muted-foreground/20 focus:border-brand-primary focus:outline-none"
                    />
                    {formData.visualReferences.length > 1 && (
                      <button
                        onClick={() => removeReference(index)}
                        className="absolute right-0 flex size-10 items-center justify-center text-muted-foreground/20 transition-colors hover:text-destructive"
                      >
                        <Trash size={20} weight="fill" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addReference}
                  className="group mt-8 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary transition-all hover:opacity-70"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary/10">
                    <Plus size={14} weight="bold" />
                  </div>
                  {t("add_reference")}
                </button>
              </div>
            ) : (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                id={currentStepConfig.id}
                value={
                  formData[
                    currentStepConfig.id as keyof typeof formData
                  ] as string
                }
                onChange={(event) => setValue(event.target.value)}
                className="w-full min-h-[300px] resize-none bg-transparent text-2xl font-medium leading-relaxed text-foreground placeholder:text-muted-foreground/20 focus:outline-none xl:text-3xl"
                placeholder="Escreva sua resposta aqui..."
              />
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-border/20 pt-8">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
            className="group flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 transition-all disabled:opacity-30 hover:text-foreground"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            {t("back_button")}
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 sm:inline-block">
              Pressione{" "}
              <kbd className="rounded border border-border/40 bg-muted/20 px-1 font-sans">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-border/40 bg-muted/20 px-1 font-sans">
                Enter
              </kbd>{" "}
              para avançar
            </span>

            {currentStepIndex < stepsConfig.length - 1 ? (
              <Button
                onClick={handleNext}
                className="h-14 rounded-none bg-foreground px-10 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background transition-all hover:bg-brand-primary hover:text-white"
              >
                {t("next_step")}
                <ArrowRight size={16} className="ml-3" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  "h-14 rounded-none px-12 font-mono text-[10px] font-black uppercase tracking-[0.3em] transition-all bg-brand-primary text-white hover:opacity-90"
                )}
              >
                {isLoading ? (
                  <CircleNotch size={16} className="mr-3 animate-spin" />
                ) : null}
                {t("submit")}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
