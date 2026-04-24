import { z } from "zod"

const optionalUrlList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)
    return value
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
  })
  .pipe(z.array(z.string().url("Cada referência precisa ser uma URL válida")))

const assetSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  key: z.string(),
})

export const briefingSchema = z.object({
  // 1. Contexto de Negócio (Existing + New)
  companyName: z.string().optional(),
  projectName: z.string().optional(),
  businessDescription: z
    .string()
    .trim()
    .min(10, "Descreva o negócio")
    .optional(),
  brandTone: z.string().trim().min(10, "Descreva o tom da marca"),
  businessGoals: z.string().trim().min(10, "Defina os objetivos do projeto"),
  primaryCta: z.string().trim().min(3, "Informe a principal conversão"),
  targetAudience: z.string().trim().min(10, "Descreva o público-alvo"),
  differentiators: z.string().trim().min(10, "Liste os diferenciais da marca"),

  // 2. Identidade da Marca
  logos: z
    .object({
      primary: assetSchema.optional(),
      secondary: assetSchema.optional(),
      light: assetSchema.optional(),
      dark: assetSchema.optional(),
    })
    .optional(),
  palette: z
    .object({
      primary: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hex inválido")
        .optional(),
      secondary: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hex inválido")
        .optional(),
      accent: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hex inválido")
        .optional(),
      extra: z.array(z.string()).optional(),
    })
    .optional(),
  typography: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
    })
    .optional(),
  brandbook: assetSchema.optional(),

  // 3. Direção Visual
  visualReferences: optionalUrlList,
  dislikedReferences: optionalUrlList,
  competitors: z.array(z.string()).optional(),
  desiredPerceptions: z.array(z.string()).optional(),
  forbiddenPerceptions: z.array(z.string()).optional(),

  // 4. Acessos e Infra
  infrastructure: z
    .object({
      domain: z.string().optional(),
      hosting: z.string().optional(),
      analytics: z.string().optional(),
      socialMedia: z.record(z.string().url()).optional(),
      technicalNotes: z.string().optional(),
    })
    .optional(),

  // 5. Regras Operacionais
  governance: z
    .object({
      primaryApprover: z.string().min(2, "Informe o aprovador principal"),
      financialApprover: z.string().optional(),
      preferredCommunication: z.string().default("PLATFORM"),
    })
    .optional(),
})

export type BriefingInput = z.infer<typeof briefingSchema>
