import * as React from "react"
import { getTranslations } from "next-intl/server"
import { DashboardUpdate } from "@/src/types/dashboard"
import { ClientApprovalCard } from "./ClientApprovalCard"
import { ApprovalStatus } from "@/src/generated/client/enums"

interface ClientApprovalListProps {
  updates: DashboardUpdate[]
  projectId: string
}

export async function ClientApprovalList({ updates, projectId }: ClientApprovalListProps) {
  const t = await getTranslations("Approvals")
  
  const pendingUpdates = updates.filter(u => u.requiresApproval && u.approvalStatus === ApprovalStatus.PENDING)

  if (pendingUpdates.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-border/30 bg-muted/5 py-20 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          Nenhuma validação pendente
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {pendingUpdates.map((update) => (
        <ClientApprovalCard key={update.id} update={update} projectId={projectId} />
      ))}
    </div>
  )
}
