import { LeadStatus } from "@/src/generated/client/enums"

export interface Lead {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  status: LeadStatus
  notes: string | null
  value: string | null
  createdAt: string | Date
  updatedAt: string | Date
}
