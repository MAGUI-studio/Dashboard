"use client"

import * as React from "react"

import { Prisma } from "@/src/generated/client"
import {
  Calendar,
  CurrencyCircleDollar,
  FileText,
  Handshake,
  Note,
  Tag,
  User,
} from "@phosphor-icons/react"

import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"

import { ProjectKickoffChecklist } from "./ProjectKickoffChecklist"

interface ProjectHandoffTabProps {
  handoff: Prisma.ProjectHandoffGetPayload<{
    include: {
      proposal: {
        include: {
          items: true
        }
      }
    }
  }> | null
  kickoff: Prisma.ProjectKickoffChecklist | null
}

interface SoldItem {
  description: string
  longDescription?: string
  unitValue: number
  quantity: number
}

export function ProjectHandoffTab({
  handoff,
  kickoff,
}: ProjectHandoffTabProps) {
  if (!handoff) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <Handshake className="size-16 mb-4" />
        <p className="font-heading text-xl font-black uppercase tracking-tight">
          Handoff não disponível
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest mt-1">
          Este projeto não possui registro formal de transição.
        </p>
      </div>
    )
  }

  const soldItems = (Array.isArray(handoff.soldItems)
    ? handoff.soldItems
    : []) as unknown as SoldItem[]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <ProjectKickoffChecklist kickoff={kickoff} />

        <Card className="rounded-[2rem] border-border/40 bg-background/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground">
                <FileText weight="fill" className="size-4" />
              </div>
              <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                Notas do Handoff
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground bg-muted/10 p-6 rounded-2xl border border-border/20 italic">
              {handoff.handoffNotes ||
                "Nenhuma observação operacional adicional registrada no momento do handoff."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card className="rounded-[2rem] border-border/40 bg-background/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/40 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Tag weight="fill" className="size-5" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl font-black uppercase tracking-tight">
                    Snapshot Comercial
                  </CardTitle>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    O que foi vendido
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-700"
              >
                PROPOSTA #{handoff.proposal?.number || "N/A"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CurrencyCircleDollar
                  weight="fill"
                  className="size-4 text-emerald-600"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700/70">
                  Itens e Valores
                </span>
              </div>

              <div className="space-y-3">
                {soldItems.map((item: SoldItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-muted/10 border border-border/20"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground/90">
                        {item.description}
                      </p>
                      {item.longDescription && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {item.longDescription}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-tight text-foreground">
                        {handoff.currency}{" "}
                        {item.unitValue.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="font-heading text-sm font-black uppercase tracking-widest text-emerald-800/80">
                  Valor Total Negociado
                </span>
                <span className="font-heading text-xl font-black text-emerald-600">
                  {handoff.currency}{" "}
                  {handoff.finalValue?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <Separator className="bg-border/40" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Note weight="fill" className="size-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Notas Comerciais
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                {handoff.commercialNotes || "Sem notas comerciais adicionais."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/5 border border-border/20 space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
                  <User className="size-3" />
                  Owner Comercial
                </div>
                <p className="text-[11px] font-bold uppercase">MAGUI Studio</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/5 border border-border/20 space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
                  <Calendar className="size-3" />
                  Data do Handoff
                </div>
                <p className="text-[11px] font-bold uppercase">
                  {new Date(handoff.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
