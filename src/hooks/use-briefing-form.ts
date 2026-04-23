import * as React from "react"

import { toast } from "sonner"

import {
  savePartialBriefingAction,
  updateProjectBriefingAction,
} from "@/src/lib/actions/project.actions"

export const stepsConfig = [
  { id: "brandTone", min: 100 },
  { id: "visualReferences", min: 0 },
  { id: "businessGoals", min: 100 },
  { id: "primaryCta", min: 100 },
  { id: "targetAudience", min: 100 },
  { id: "differentiators", min: 100 },
] as const

export type StepId = (typeof stepsConfig)[number]["id"]

export function useBriefingForm(
  projectId: string,
  initialData: Record<string, unknown> | null | undefined
) {
  const [formData, setFormData] = React.useState({
    brandTone: String(initialData?.brandTone || ""),
    visualReferences: Array.isArray(initialData?.visualReferences)
      ? (initialData.visualReferences as string[])
      : [""],
    businessGoals: String(initialData?.businessGoals || ""),
    primaryCta: String(initialData?.primaryCta || ""),
    targetAudience: String(initialData?.targetAudience || ""),
    differentiators: String(initialData?.differentiators || ""),
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

  const firstMissingId =
    stepsConfig.find(
      (s) =>
        s.min > 0 &&
        (!initialData?.[s.id] || String(initialData[s.id]).length < s.min)
    )?.id || stepsConfig[0].id
  const [currentStepId, setCurrentStepId] =
    React.useState<StepId>(firstMissingId)

  const currentStepIndex = stepsConfig.findIndex((s) => s.id === currentStepId)

  const isFieldMissing = (id: string) => {
    const config = stepsConfig.find((s) => s.id === id)
    if (!config || config.min === 0) return false
    const val = formData[id as keyof typeof formData]
    return typeof val === "string" && val.trim().length < config.min
  }

  const saveCurrent = async () => {
    const val = formData[currentStepId as keyof typeof formData]
    if (val)
      await savePartialBriefingAction(projectId, { [currentStepId]: val })
  }

  const handleNext = async () => {
    if (currentStepIndex < stepsConfig.length - 1) {
      await saveCurrent()
      setCurrentStepId(stepsConfig[currentStepIndex + 1].id)
    }
  }

  const handleSubmit = async () => {
    if (stepsConfig.some((s) => isFieldMissing(s.id))) {
      setShowErrors(true)
      toast.error("Preencha todos os campos obrigatorios.")
      return
    }
    setIsLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await updateProjectBriefingAction(projectId, formData as any)
    if (result.success) setIsFinished(true)
    else toast.error(result.error || "Erro ao salvar.")
    setIsLoading(false)
  }

  return {
    formData,
    setFormData,
    currentStepId,
    setCurrentStepId,
    currentStepIndex,
    isFinished,
    isLoading,
    showErrors,
    isFieldMissing,
    handleNext,
    handleSubmit,
  }
}
