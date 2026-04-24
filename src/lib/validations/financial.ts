import { InstallmentStatus } from "@/src/generated/client"
import { z } from "zod"

export const BillingProfileSchema = z.object({
  legalName: z.string().min(1, "Razão Social é obrigatória"),
  tradeName: z.string().optional(),
  taxId: z.string().min(1, "CPF/CNPJ é obrigatório"),
  billingEmail: z.string().email("E-mail inválido"),
  billingPhone: z.string().optional(),

  addressStreet: z.string().min(1, "Rua é obrigatória"),
  addressNumber: z.string().min(1, "Número é obrigatório"),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().min(1, "Bairro é obrigatório"),
  addressCity: z.string().min(1, "Cidade é obrigatória"),
  addressState: z.string().length(2, "Estado (UF) deve ter 2 caracteres"),
  addressZipCode: z.string().min(1, "CEP é obrigatório"),
})

export const CreateInstallmentSchema = z.object({
  number: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.date(),
})

export const CreateInvoiceSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  projectId: z.string().optional(),
  proposalId: z.string().optional(),
  documentId: z.string().optional(),
  totalAmount: z.number().positive(),
  currency: z.string().default("BRL"),
  dueDate: z.date().optional(),
  installments: z
    .array(CreateInstallmentSchema)
    .min(1, "Pelo menos uma parcela é obrigatória"),
})

export const RegisterPaymentEventSchema = z.object({
  installmentId: z.string(),
  type: z.string().min(1, "Tipo de pagamento é obrigatório"), // PIX, TED, etc.
  amount: z.number().positive(),
  date: z.date().default(new Date()),
  note: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentKey: z.string().optional(),
})

export const UpdateInstallmentStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(InstallmentStatus),
  paidAt: z.date().optional(),
})

export type BillingProfileInput = z.infer<typeof BillingProfileSchema>
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>
export type RegisterPaymentEventInput = z.infer<
  typeof RegisterPaymentEventSchema
>
