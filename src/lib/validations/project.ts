import { z } from "zod"

export const createProjectSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  projectName: z.string().min(2, "Nome do projeto é obrigatório"),
  projectDescription: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
