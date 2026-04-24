import { z } from "zod"

export const ThreadStatusSchema = z.enum(["OPEN", "RESOLVED", "ARCHIVED"])
export const MessageTypeSchema = z.enum([
  "INFORMATIVE",
  "REQUIRES_RESPONSE",
  "REQUIRES_APPROVAL",
  "REQUIRES_ASSET",
  "FINANCIAL",
  "LEGAL",
  "CALL_SUMMARY",
])

export const CreateThreadSchema = z.object({
  projectId: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  title: z.string().min(1, "Title is required").optional(),
})

export const SendMessageSchema = z.object({
  threadId: z.string().cuid(),
  content: z.string().min(1, "Content is required"),
  type: MessageTypeSchema.default("INFORMATIVE"),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        key: z.string(),
      })
    )
    .default([]),
  requiresResponse: z.boolean().default(false),
})

export const ResolveMessageSchema = z.object({
  messageId: z.string().cuid(),
})

export const RegisterDecisionSchema = z.object({
  projectId: z.string().cuid(),
  threadId: z.string().cuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  decision: z.string().min(1, "Decision is required"),
  impactScope: z.string().optional(),
  impactDeadline: z.string().optional(),
  impactFinancial: z.string().optional(),
})
