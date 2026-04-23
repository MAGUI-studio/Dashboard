"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Lead, MessageTemplate } from "@/src/types/crm"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { InstagramLogo, NotePencil, Phone } from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { Button } from "@/src/components/ui/button"

import { LeadDetailsDrawer } from "@/src/components/admin/LeadDetailsDrawer"

import { getLeadDaysWithoutMovement, isLeadStagnant } from "@/src/lib/utils/crm"

interface KanbanLeadCardProps {
  lead: Lead
  density?: "comfortable" | "compact"
  dragDisabled?: boolean
  dragging?: boolean
  isOpen?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  onDrawerOpenChange: (leadId: string, open: boolean) => void
  onLeadUpdated: (lead: Lead) => void
  onLeadDeleted: (leadId: string) => void
}

export function KanbanLeadCard({
  lead,
  density = "comfortable",
  dragDisabled = false,
  dragging: _dragging = false,
  isOpen = false,
  clients,
  templates,
  onDrawerOpenChange,
  onLeadUpdated,
  onLeadDeleted,
}: KanbanLeadCardProps) {
  const t = useTranslations("Admin.crm")
  const stagnant = isLeadStagnant(lead)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    disabled: dragDisabled,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.article
      ref={setNodeRef}
      layout
      style={style}
      {...attributes}
      {...(listeners ?? {})}
      className={`group rounded-[1.5rem] border bg-background/95 p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] transition-all ${
        stagnant
          ? "border-amber-500/25"
          : "border-border/50 hover:border-border/70"
      } ${isDragging || _dragging ? "cursor-grabbing opacity-90 shadow-[0_32px_80px_-38px_rgba(15,23,42,0.55)]" : "cursor-grab"}`}
    >
      <div className="min-w-0 space-y-2">
        <p className="truncate text-base font-black tracking-tight text-foreground">
          {lead.companyName}
        </p>
        {lead.contactName && (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/55">
            {lead.contactName}
          </p>
        )}
      </div>

      <div
        className={`mt-4 grid rounded-[1.25rem] border border-border/35 bg-muted/10 ${density === "compact" ? "gap-2 p-3" : "gap-3 p-3.5"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">
            {t(`source.${lead.source}`)}
          </span>
          {stagnant && (
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              {getLeadDaysWithoutMovement(lead)}d parado
            </span>
          )}
        </div>
        {(lead.instagram || lead.phone) && (
          <div className="grid gap-2 text-sm text-foreground/80">
            {lead.instagram && (
              <div className="flex items-center gap-2 truncate">
                <InstagramLogo
                  size={14}
                  className="shrink-0 text-muted-foreground/55"
                />
                <span className="truncate">{lead.instagram}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 truncate">
                <Phone
                  size={14}
                  className="shrink-0 text-muted-foreground/55"
                />
                <span className="truncate">{lead.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between gap-3 ${density === "compact" ? "mt-3" : "mt-4"}`}
      >
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
          <NotePencil size={12} /> {lead.followUpNotes?.length || 0} nota(s)
        </span>
        <LeadDetailsDrawer
          lead={lead}
          onOpenChange={(open) => onDrawerOpenChange(lead.id, open)}
          open={isOpen}
          clients={clients}
          templates={templates}
          onLeadUpdated={onLeadUpdated}
          onLeadDeleted={onLeadDeleted}
        >
          <Button
            variant="outline"
            className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.2em]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            Abrir
          </Button>
        </LeadDetailsDrawer>
      </div>
    </motion.article>
  )
}
