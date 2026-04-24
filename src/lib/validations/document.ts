import { DocumentStatus, DocumentType } from "@/src/generated/client"
import { z } from "zod"

export const DocumentClauseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título da cláusula é obrigatório"),
  content: z.string().min(1, "Conteúdo da cláusula é obrigatório"),
  order: z.number().default(0),
  isRequired: z.boolean().default(true),
  subclauses: z
    .array(
      z.object({
        label: z.string(),
        content: z.string(),
        order: z.number(),
      })
    )
    .default([]),
})

export const DocumentSignerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: z.string().optional(),
})

export const CreateDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType).default("CONTRACT"),
  title: z.string().min(1, "Título é obrigatório"),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  sourceLeadId: z.string().optional(),

  contractedData: z.record(z.any()).optional(),
  contractingData: z.record(z.any()).optional(),
  commercialData: z.record(z.any()).optional(),

  clauses: z.array(DocumentClauseSchema).optional(),
  signers: z.array(DocumentSignerSchema).optional(),
})

export const UpdateDocumentStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(DocumentStatus),
})

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>
export type DocumentClauseInput = z.infer<typeof DocumentClauseSchema>
export type DocumentSignerInput = z.infer<typeof DocumentSignerSchema>
