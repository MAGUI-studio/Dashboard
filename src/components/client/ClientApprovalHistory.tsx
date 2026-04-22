import * as React from "react"

import { ApprovalStatus } from "@/src/generated/client/enums"
import { ClientPortalUpdate } from "@/src/types/client-portal"
import {
  CheckCircle,
  ClockCountdown,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

interface ClientApprovalHistoryProps {
  updates: ClientPortalUpdate[]
}

export async function ClientApprovalHistory({
  updates,
}: ClientApprovalHistoryProps) {
  const historyUpdates = updates.filter(
    (u) => u.requiresApproval && u.approvalStatus !== ApprovalStatus.PENDING
  )

  if (historyUpdates.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 px-2">
        <ClockCountdown
          weight="duotone"
          className="size-5 text-muted-foreground/40"
        />
        <h2 className="font-heading text-xl font-black uppercase tracking-tight text-muted-foreground/60">
          Histórico de Decisões
        </h2>
      </div>

      <div className="grid gap-4">
        {historyUpdates.map((update) => (
          <div
            key={update.id}
            className="flex items-center justify-between gap-6 rounded-3xl border border-border/20 bg-muted/5 p-6 transition-all hover:bg-muted/10"
          >
            <div className="flex items-center gap-5 overflow-hidden">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/40 shadow-sm ring-1 ring-border/20 ${
                  update.approvalStatus === ApprovalStatus.APPROVED
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {update.approvalStatus === ApprovalStatus.APPROVED ? (
                  <CheckCircle weight="duotone" className="size-5" />
                ) : (
                  <WarningCircle weight="duotone" className="size-5" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <p className="truncate text-sm font-black tracking-tight text-foreground">
                  {update.title}
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {update.approvalStatus === ApprovalStatus.APPROVED
                    ? `Aprovado em ${update.approvedAt ? new Date(update.approvedAt).toLocaleDateString("pt-BR") : "N/A"}`
                    : "Ajustes Solicitados"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
