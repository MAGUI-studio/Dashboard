import { z } from "zod"

export const createProjectSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  projectName: z.string().min(2, "Nome do projeto é obrigatório"),
  projectDescription: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectStatusSchema = z.object({
  id: z.string(),
  status: z.enum([
    "STRATEGY",
    "ARCHITECTURE",
    "DESIGN",
    "ENGINEERING",
    "QA",
    "LAUNCHED",
  ]),
  progress: z.number().min(0).max(100),
})

export const addProjectTimelineSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2, "Título é obrigatório"),
  description: z.string().optional(),
  isMilestone: z.boolean().default(false),
  timezone: z.string(),
})
