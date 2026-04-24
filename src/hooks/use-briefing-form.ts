import * as React from "react"

import { Prisma } from "@/src/generated/client"
import { toast } from "sonner"

import {
  savePartialBriefingAction,
  updateProjectBriefingAction,
} from "@/src/lib/actions/project.actions"

export const stepsConfig = [
  // 1. Contexto de Negócio
  { id: "businessDescription", min: 100 },
  { id: "brandTone", min: 100 },
  { id: "businessGoals", min: 100 },
  { id: "primaryCta", min: 10 },
  { id: "targetAudience", min: 100 },
  { id: "differentiators", min: 100 },

  // 2. Identidade da Marca
  { id: "logos", min: 0 },
  { id: "palette", min: 0 },
  { id: "typography", min: 0 },
  { id: "brandbook", min: 0 },

  // 3. Direção Visual
  { id: "visualReferences", min: 0 },
  { id: "dislikedReferences", min: 0 },
  { id: "competitors", min: 0 },
  { id: "desiredPerceptions", min: 0 },

  // 4. Acessos e Infra
  { id: "infrastructure", min: 0 },

  // 5. Regras Operacionais
  { id: "governance", min: 2 },
] as const

export type StepId = (typeof stepsConfig)[number]["id"]

export function useBriefingForm(
  projectId: string,
  initialData: Prisma.JsonValue | null | undefined
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (initialData as any) || {}
  const [formData, setFormData] = React.useState({
    businessDescription: String(data?.businessDescription || ""),
    brandTone: String(data?.brandTone || ""),
    businessGoals: String(data?.businessGoals || ""),
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
    typography: data?.typography || { primary: "", secondary: "" },
    brandbook: data?.brandbook || null,

    visualReferences: Array.isArray(data?.visualReferences)
      ? data.visualReferences
      : [""],
    dislikedReferences: Array.isArray(data?.dislikedReferences)
      ? data.dislikedReferences
      : [""],
    competitors: Array.isArray(data?.competitors) ? data.competitors : [""],
    desiredPerceptions: Array.isArray(data?.desiredPerceptions)
      ? data.desiredPerceptions
      : [""],

    infrastructure: data?.infrastructure || {
      domain: "",
      hosting: "",
      analytics: "",
      technicalNotes: "",
    },
    governance: data?.governance || {
      primaryApprover: "",
      financialApprover: "",
      preferredCommunication: "PLATFORM",
    },
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

  const firstMissingId =
    stepsConfig.find(
      (s) => s.min > 0 && (!data?.[s.id] || String(data[s.id]).length < s.min)
    )?.id || stepsConfig[0].id

  const [currentStepId, setCurrentStepId] =
    React.useState<StepId>(firstMissingId)
  const currentStepIndex = stepsConfig.findIndex((s) => s.id === currentStepId)

  const isFieldMissing = (id: string) => {
    const config = stepsConfig.find((s) => s.id === id)
    if (!config || config.min === 0) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (formData as any)[id]
    if (typeof val === "string") return val.trim().length < config.min
    if (id === "governance")
      return !val.primaryApprover || val.primaryApprover.length < config.min
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
  }
}
