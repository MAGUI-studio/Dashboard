"use client"

import * as React from "react"

import { ClockCounterClockwise, FilePdf, User } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DocumentHistoryProps {
  versions: Array<{
    id: string
    versionNumber: number
    pdfUrl: string | null
    createdAt: Date
    createdBy: { name: string | null } | null
  }>
}

export function DocumentHistory({ versions }: DocumentHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground">
          <ClockCounterClockwise weight="fill" className="size-4" />
        </div>
        <h3 className="font-heading text-xl font-black uppercase tracking-tight">
          Histórico de Versões
        </h3>
      </div>

      <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border/40">
        {versions.map((version) => (
          <div key={version.id} className="relative pl-12">
            <div className="absolute left-0 top-1.5 flex size-8 items-center justify-center rounded-full bg-background ring-4 ring-background">
              <div className="size-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary),0.5)]" />
            </div>

            <div className="p-6 rounded-[1.5rem] border border-border/40 bg-background/40 hover:bg-muted/5 transition-all group">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-heading text-sm font-black uppercase tracking-tight">
                    Versão {version.versionNumber}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {version.createdBy?.name || "Sistema"}
                    </span>
                    <span className="size-1 rounded-full bg-muted-foreground/20" />
                    <span>
                      {format(new Date(version.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                {version.pdfUrl && (
                  <a
                    href={version.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/10 border border-border/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/20 transition-all"
                  >
                    <FilePdf weight="fill" className="size-4" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
