import {
  AssetType,
  Priority,
  ProjectCategory,
  ProjectStatus,
} from "@/src/generated/client/enums"
import { z } from "zod"

import { briefingSchema } from "@/src/lib/validations/briefing"

export const createProjectSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  projectName: z.string().min(2, "Nome do projeto é obrigatório"),
  projectDescription: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  liveUrl: z
    .string()
    .url("URL de produção inválida")
    .optional()
    .or(z.literal("")),
  repositoryUrl: z
    .string()
    .url("URL do repositório inválida")
    .optional()
    .or(z.literal("")),
  category: z.nativeEnum(ProjectCategory),
  priority: z.nativeEnum(Priority),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(ProjectStatus),
  progress: z.number().min(0).max(100),
})

const updateAttachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  key: z.string().min(1),
  customId: z.string().nullable().optional(),
  type: z.nativeEnum(AssetType),
  mimeType: z.string().nullable().optional(),
  size: z.number().int().positive().nullable().optional(),
})

export const addProjectTimelineSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2, "Título é obrigatório"),
  description: z.string().optional(),
  isMilestone: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal("")),
  attachments: z.array(updateAttachmentSchema).default([]),
  timezone: z.string(),
})

export const rejectProjectUpdateSchema = z.object({
  updateId: z.string().min(1),
  projectId: z.string().min(1),
  feedback: z.string().trim().min(10, "Explique o ajuste necessário"),
})

export { briefingSchema }
