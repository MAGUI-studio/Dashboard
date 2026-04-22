import * as React from "react"

import { ApprovalStatus } from "@/src/generated/client/enums"
import { ClientPortalUpdate } from "@/src/types/client-portal"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

import { ClientApprovalCard } from "./ClientApprovalCard"
import { ClientEmptyState } from "./ClientEmptyState"

interface ClientApprovalListProps {
  updates: ClientPortalUpdate[]
  projectId: string
}

export async function ClientApprovalList({
  updates,
  projectId,
}: ClientApprovalListProps) {
  const pendingUpdates = updates.filter(
    (u) => u.requiresApproval && u.approvalStatus === ApprovalStatus.PENDING
  )

  if (pendingUpdates.length === 0) {
    return (
      <ClientEmptyState
        title="Tudo validado por enquanto"
        description="Quando uma entrega precisar da sua decisao, ela aparece aqui com botoes para aprovar ou pedir ajuste."
        icon={CheckCircle}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {pendingUpdates.map((update) => (
        <ClientApprovalCard
          key={update.id}
          update={update}
          projectId={projectId}
        />
      ))}
    </div>
  )
}
