import { z } from "zod"

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

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
})

export const maguiConnectLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: safeUrlSchema,
})

export type MaguiConnectProfileInput = z.infer<typeof maguiConnectProfileSchema>
export type MaguiConnectLinkInput = z.infer<typeof maguiConnectLinkSchema>
