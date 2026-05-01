import { z } from "zod"

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const optionalSlugSchema = z
  .string()
  .optional()
  .nullable()
  .transform(normalizeOptionalText)
  .transform((value) => (value ? normalizeSlug(value) : null))
  .refine(
    (value) => value === null || (value.length >= 3 && value.length <= 40),
    {
      message: "Slug deve ter entre 3 e 40 caracteres",
    }
  )
  .refine(
    (value) => value === null || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    {
      message: "Slug invalido",
    }
  )

const optionalDomainSchema = z
  .string()
  .optional()
  .nullable()
  .transform(normalizeOptionalText)
  .transform((value) => (value ? value.toLowerCase() : null))
  .refine(
    (value) =>
      value === null ||
      /^(?=.{3,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
        value
      ),
    "Dominio invalido"
  )

const safeUrlSchema = z
  .string()
  .min(1)
  .transform(normalizeUrl)
  .refine((value) => {
    try {
      const url = new URL(value)
      return ["http:", "https:"].includes(url.protocol)
    } catch {
      return false
    }
  }, "URL invalida")

export const maguiConnectProfileSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(280).optional().nullable(),
  slug: optionalSlugSchema,
  domain: optionalDomainSchema,
})

export const maguiConnectLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: safeUrlSchema,
})

export type MaguiConnectProfileInput = z.infer<typeof maguiConnectProfileSchema>
export type MaguiConnectLinkInput = z.infer<typeof maguiConnectLinkSchema>
