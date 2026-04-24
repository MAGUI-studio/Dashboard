"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadSource } from "@/src/generated/client/enums"
import { Lead } from "@/src/types/crm"
import {
  ChatCircleText,
  Clock,
  Copy,
  EnvelopeSimple,
  Globe,
  InstagramLogo,
  LinkSimple,
  Phone,
  WhatsappLogo,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { sanitizePhoneForWhatsApp } from "@/src/lib/utils/crm"

interface LeadInfoDisplayProps {
  lead: Lead
}

export function LeadInfoDisplay({ lead }: LeadInfoDisplayProps) {
  const t = useTranslations("Admin.crm")

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const phone = sanitizePhoneForWhatsApp(lead.phone)
  const whatsappUrl = phone ? `https://wa.me/${phone}` : null

  return (
    <div className="grid gap-12">
      {/* Reminders & Urgency */}
      {lead.nextActionAt && (
        <div className="flex items-center justify-between rounded-full border border-brand-primary/10 bg-brand-primary/[0.03] py-4 pl-6 pr-4">
          <div className="flex items-center gap-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Clock size={16} weight="bold" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary/60">
                Ação Agendada
              </p>
              <p className="text-xs font-bold text-foreground">
                {new Date(lead.nextActionAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary"></span>
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-2">
        {/* Contact Intelligence */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/10" />
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
              Inteligência de Contato
            </h4>
          </div>

          <div className="space-y-6 px-2">
            <div className="group space-y-1.5">
              <Label label="Responsável" icon={ChatCircleText} />
              <p className="pl-6 text-sm font-bold text-foreground/90">
                {lead.contactName || "Time Comercial"}
              </p>
            </div>

            {lead.email && (
              <div className="group space-y-1.5">
                <Label label="E-mail Corporativo" icon={EnvelopeSimple} />
                <div className="flex items-center justify-between pl-6">
                  <p className="truncate text-sm font-bold text-foreground/90">
                    {lead.email}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => copyToClipboard(lead.email!, "E-mail")}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            )}

            {lead.phone && (
              <div className="group space-y-1.5">
                <Label label="Telefone / WhatsApp" icon={Phone} />
                <div className="flex items-center justify-between pl-6">
                  <p className="text-sm font-bold text-foreground/90">
                    {lead.phone}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full"
                      onClick={() => copyToClipboard(lead.phone!, "Telefone")}
                    >
                      <Copy size={14} />
                    </Button>
                    {whatsappUrl && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full text-green-600 hover:bg-green-500/10"
                      >
                        <a href={whatsappUrl} target="_blank" rel="noreferrer">
                          <WhatsappLogo size={16} weight="fill" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Source & Presence */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/10" />
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
              Origem e Presença
            </h4>
          </div>

          <div className="space-y-6 px-2">
            <div className="space-y-1.5">
              <Label label="Canal de Aquisição" icon={LinkSimple} />
              <p className="pl-6 text-sm font-bold text-foreground/90">
                {t(`source.${lead.source}`)}
              </p>
            </div>

            {lead.instagram && (
              <div className="space-y-1.5">
                <Label label="Instagram" icon={InstagramLogo} />
                <div className="flex items-center gap-2 pl-6">
                  <p className="text-sm font-bold text-foreground/90">
                    @{lead.instagram.replace("@", "")}
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-brand-primary/60"
                  >
                    <a
                      href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ArrowSquareOut size={14} />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {lead.website && (
              <div className="space-y-1.5">
                <Label
                  label={
                    lead.source === LeadSource.LINKEDIN
                      ? "LinkedIn"
                      : "Website Oficial"
                  }
                  icon={Globe}
                />
                <div className="flex items-center gap-2 pl-6">
                  <p className="truncate text-sm font-bold text-foreground/90">
                    {lead.website.replace(/^https?:\/\//, "")}
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-brand-primary/60"
                  >
                    <a href={lead.website} target="_blank" rel="noreferrer">
                      <ArrowSquareOut size={14} />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Label({
  label,
  icon: Icon,
}: {
  label: string
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} weight="bold" className="text-muted-foreground/30" />
      <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/30">
        {label}
      </span>
    </div>
  )
}

function ArrowSquareOut({
  size,
  className,
}: {
  size: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 256 256"
      className={className}
    >
      <path d="M224,104a8,8,0,0,1-16,0V59.31l-66.34,66.35a8,8,0,0,1-11.32-11.32L196.69,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V48h72a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V136A8,8,0,0,0,184,128Z"></path>
    </svg>
  )
}
