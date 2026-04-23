"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadSource } from "@/src/generated/client/enums"
import { Lead } from "@/src/types/crm"
import {
  ChatCircleText,
  Clock,
  EnvelopeSimple,
  Globe,
  InstagramLogo,
  LinkSimple,
  Phone,
} from "@phosphor-icons/react"

interface LeadInfoDisplayProps {
  lead: Lead
}

export function LeadInfoDisplay({ lead }: LeadInfoDisplayProps) {
  const t = useTranslations("Admin.crm")

  const infoItems = [
    lead.contactName && {
      label: "Contato",
      value: lead.contactName,
      icon: ChatCircleText,
    },
    lead.phone && { label: "Telefone", value: lead.phone, icon: Phone },
    lead.email && { label: "E-mail", value: lead.email, icon: EnvelopeSimple },
    { label: "Origem", value: t(`source.${lead.source}`), icon: LinkSimple },
    lead.source === LeadSource.INSTAGRAM &&
      lead.instagram && {
        label: "Instagram",
        value: lead.instagram,
        icon: InstagramLogo,
      },
    lead.website && {
      label:
        lead.source === LeadSource.LINKEDIN
          ? "LinkedIn"
          : lead.source === LeadSource.WEBSITE
            ? "Site"
            : "Link",
      value: lead.website,
      icon: Globe,
    },
  ].filter(Boolean) as Array<{
    label: string
    value: string
    icon: React.ElementType
  }>

  return (
    <section className="mb-2 grid gap-x-6 gap-y-4 border-b border-border/15 pb-8 md:grid-cols-2">
      {lead.nextActionAt && (
        <div className="grid gap-2 rounded-2xl border border-brand-primary/10 bg-brand-primary/[0.03] p-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary/70">
              Lembrete
            </p>
          </div>
          <p className="pl-6 text-sm font-bold">
            {new Date(lead.nextActionAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}
      {infoItems.map((item) => (
        <div key={item.label} className="grid gap-2">
          <div className="flex items-center gap-2">
            <item.icon size={16} className="text-muted-foreground/55" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              {item.label}
            </p>
          </div>
          <p className="break-words pl-6 text-sm font-semibold text-foreground/85">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  )
}
