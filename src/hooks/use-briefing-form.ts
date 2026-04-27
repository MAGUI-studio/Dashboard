import * as React from "react"

import { Prisma } from "@/src/generated/client"
import { toast } from "sonner"

import {
  savePartialBriefingAction,
  updateProjectBriefingAction,
} from "@/src/lib/actions/project.actions"

export const stepsConfig = [
  // 1. Contexto de Negócio
  { id: "businessDescription", min: 50 },
  { id: "businessGoals", min: 50 },
  { id: "brandTone", min: 50 },
  { id: "primaryCta", min: 10 },
  { id: "targetAudience", min: 50 },
  { id: "differentiators", min: 50 },

  // 2. Identidade da Marca
  { id: "logos", min: 0 },
  { id: "palette", min: 0 },

  // 3. Direção Visual
  { id: "visualReferences", min: 0 },
  { id: "dislikedReferences", min: 0 },
  { id: "competitors", min: 0 },
] as const

export type StepId = (typeof stepsConfig)[number]["id"]

export function useBriefingForm(
  projectId: string,
  initialData: Prisma.JsonValue | null | undefined,
  currentStepId: StepId,
  setCurrentStepId: (step: StepId) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (initialData as any) || {}
  const [formData, setFormData] = React.useState({
    businessDescription: String(data?.businessDescription || ""),
    businessGoals: String(data?.businessGoals || ""),
    brandTone: String(data?.brandTone || ""),
    primaryCta: String(data?.primaryCta || ""),
    targetAudience: String(data?.targetAudience || ""),
    differentiators: String(data?.differentiators || ""),

    logos: data?.logos || {
      primary: null,
      secondary: null,
      light: null,
      dark: null,
    },
    palette: data?.palette || {
      primary: "#000000",
      secondary: "#FFFFFF",
      accent: "",
      extra: [],
    },

    visualReferences: Array.isArray(data?.visualReferences)
      ? data.visualReferences
      : [""],
    dislikedReferences: Array.isArray(data?.dislikedReferences)
      ? data.dislikedReferences
      : [""],
    competitors: Array.isArray(data?.competitors) ? data.competitors : [""],
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

  const currentStepIndex = stepsConfig.findIndex((s) => s.id === currentStepId)

  const isFieldMissing = (id: string) => {
    const config = stepsConfig.find((s) => s.id === id)
    if (!config || config.min === 0) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (formData as any)[id]
    if (typeof val === "string") return val.trim().length < config.min
    return false
  }

  const saveCurrent = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (formData as any)[currentStepId]
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
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }
    setIsLoading(true)
    const result = await updateProjectBriefingAction(
      projectId,
      formData as Prisma.InputJsonValue
    )
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
    saveCurrent,
  }
}
