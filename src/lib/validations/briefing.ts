import { z } from "zod"

const optionalUrlList = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(/\s+/)
          .map((item) => item.trim())
          .filter(Boolean)
      : []
  )
  .pipe(z.array(z.string().url("Cada referência precisa ser uma URL válida")))

export const briefingSchema = z.object({
  brandTone: z.string().trim().min(10, "Descreva o tom da marca"),
  visualReferences: optionalUrlList,
  businessGoals: z.string().trim().min(10, "Defina os objetivos do projeto"),
  primaryCta: z.string().trim().min(3, "Informe a principal conversão"),
  targetAudience: z.string().trim().min(10, "Descreva o público-alvo"),
  differentiators: z.string().trim().min(10, "Liste os diferenciais da marca"),
})

export type BriefingInput = z.infer<typeof briefingSchema>
