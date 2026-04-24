"use client"

import * as React from "react"

import { CheckCircle, Envelope, Signature, User } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"

import { cn } from "@/src/lib/utils/utils"

interface DocumentSignersListProps {
  signers: Array<{
    id: string
    name: string
    email: string
    role: string | null
    status: string
    signedAt: Date | null
  }>
}

export function DocumentSignersList({ signers }: DocumentSignersListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {signers.map((signer) => (
        <Card
          key={signer.id}
          className={cn(
            "rounded-2xl border transition-all overflow-hidden",
            signer.status === "SIGNED"
              ? "border-emerald-500/20 bg-emerald-500/[0.02]"
              : "border-border/40 bg-background/40"
          )}
        >
          <CardContent className="p-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  signer.status === "SIGNED"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted/20 text-muted-foreground"
                )}
              >
                <User weight="fill" className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-black uppercase tracking-tight">
                    {signer.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-black uppercase tracking-widest px-2 py-0"
                  >
                    {signer.role || "CLIENT"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60">
                  <Envelope className="size-3" />
                  {signer.email}
                </div>
                {signer.signedAt && (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600/80 uppercase mt-2">
                    <CheckCircle weight="fill" className="size-3" />
                    Assinado em{" "}
                    {format(new Date(signer.signedAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              {signer.status === "SIGNED" ? (
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                  <Signature weight="bold" className="size-4" />
                </div>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] font-black uppercase tracking-widest rounded-full">
                  PENDENTE
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
