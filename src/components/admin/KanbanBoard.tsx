"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import { LeadStatus } from "@/src/generated/client/enums"
import { usePathname } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import { CRM_STATUS_ORDER } from "@/src/lib/utils/crm"

import { useKanbanState } from "@/src/hooks/use-kanban-state"

import { KanbanColumn } from "./kanban/KanbanColumn"
import { KanbanLeadCard } from "./kanban/KanbanLeadCard"

export function KanbanBoard({
  leads,
  initialLeadId = null,
  clients,
  templates,
}: {
  leads: Lead[]
  initialLeadId?: string | null
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
}) {
  const [hasOpenDrawer, setHasOpenDrawer] = React.useState(false)
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(
    initialLeadId
  )

  const router = useRouter()
  const pathname = usePathname()
  const {
    boardState,
    setBoardState,
    activeLeadId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanState(leads, () => router.refresh())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  return (
    <div className="grid gap-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {CRM_STATUS_ORDER.filter((s) => s !== LeadStatus.CONVERTIDO).map(
            (status) => (
              <KanbanColumn
                key={status}
                status={status}
                leadIds={boardState.columnMap[status]}
                leadMap={boardState.leadMap}
                dragDisabled={hasOpenDrawer}
                density="comfortable"
                selectedLeadId={selectedLeadId}
                clients={clients}
                templates={templates}
                onDrawerOpenChange={(id, open) => {
                  setSelectedLeadId(open ? id : null)
                  setHasOpenDrawer(open)
                  if (!open && initialLeadId)
                    router.replace(pathname, { scroll: false })
                }}
                onLeadUpdated={(next) =>
                  setBoardState((curr) => ({
                    ...curr,
                    leadMap: { ...curr.leadMap, [next.id]: next },
                  }))
                }
                onLeadDeleted={(id) =>
                  setBoardState((curr) => ({
                    leadMap: Object.fromEntries(
                      Object.entries(curr.leadMap).filter(([k]) => k !== id)
                    ),
                    columnMap: Object.fromEntries(
                      Object.entries(curr.columnMap).map(([k, v]) => [
                        k,
                        v.filter((lid) => lid !== id),
                      ])
                    ) as Record<LeadStatus, string[]>,
                  }))
                }
              />
            )
          )}
        </div>
        <DragOverlay>
          {activeLeadId ? (
            <KanbanLeadCard
              lead={boardState.leadMap[activeLeadId]}
              dragging
              clients={clients}
              templates={templates}
              onDrawerOpenChange={() => {}}
              onLeadUpdated={() => {}}
              onLeadDeleted={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
