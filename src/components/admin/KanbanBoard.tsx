"use client"

import * as React from "react"

import { usePathname, useRouter } from "next/navigation"

import { LeadStatus } from "@/src/generated/client/enums"
import { Lead, MessageTemplate, SavedView } from "@/src/types/crm"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { toast } from "sonner"

import {
  deleteCrmViewAction,
  saveCrmPreferencesAction,
  saveCrmViewAction,
} from "@/src/lib/actions/crm.actions"
import {
  CRM_STATUS_ORDER,
  getLeadDaysWithoutMovement,
} from "@/src/lib/utils/crm"

import { useKanbanState } from "@/src/hooks/use-kanban-state"

import { CRMFilters } from "./KanbanFilters"
import { KanbanColumn } from "./kanban/KanbanColumn"
import { KanbanHeader } from "./kanban/KanbanHeader"
import { KanbanLeadCard } from "./kanban/KanbanLeadCard"

export function KanbanBoard({
  leads,
  initialLeadId = null,
  clients,
  templates,
  savedViews,
  preferences,
}: {
  leads: Lead[]
  initialLeadId?: string | null
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  savedViews: SavedView[]
  preferences: { density: "comfortable" | "compact" }
}) {
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<CRMFilters>({
    source: "all",
    stagnation: "all",
    hasContact: "all",
  })
  const [hasOpenDrawer, setHasOpenDrawer] = React.useState(false)
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(
    initialLeadId
  )
  const [isSavingView, setIsSavingView] = React.useState(false)
  const [isDeletingViewId, setIsDeletingViewId] = React.useState<string | null>(
    null
  )
  const [viewItems, setViewItems] = React.useState(savedViews)
  const [density, setDensity] = React.useState(preferences.density)

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

  React.useEffect(() => {
    setViewItems(savedViews)
  }, [savedViews])

  const visibleLeadIds = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    return new Set(
      Object.values(boardState.leadMap)
        .filter((lead) => {
          if (query) {
            const haystack = [
              lead.companyName,
              lead.contactName ?? "",
              lead.email ?? "",
              lead.instagram ?? "",
              lead.phone ?? "",
            ]
            if (!haystack.some((v) => v.toLowerCase().includes(query)))
              return false
          }
          if (filters.source !== "all" && lead.source !== filters.source)
            return false
          if (filters.stagnation !== "all") {
            const days = getLeadDaysWithoutMovement(lead)
            if (days < parseInt(filters.stagnation)) return false
          }
          if (filters.hasContact !== "all") {
            if (filters.hasContact === "phone" && !lead.phone) return false
            if (filters.hasContact === "instagram" && !lead.instagram)
              return false
            if (filters.hasContact === "email" && !lead.email) return false
          }
          return true
        })
        .map((l) => l.id)
    )
  }, [boardState.leadMap, search, filters])

  const filteredColumnMap = React.useMemo(
    () =>
      CRM_STATUS_ORDER.reduce(
        (acc, status) => {
          acc[status] = boardState.columnMap[status].filter((id) =>
            visibleLeadIds.has(id)
          )
          return acc
        },
        {} as Record<LeadStatus, string[]>
      ),
    [boardState.columnMap, visibleLeadIds]
  )

  const handleSaveView = async (name: string) => {
    setIsSavingView(true)
    const result = await saveCrmViewAction({
      name,
      filters: { search, ...filters },
    })
    if (result.success) {
      toast.success("Visão salva.")
      setViewItems((curr) => [
        {
          id: `local-${crypto.randomUUID()}`,
          userId: "local",
          module: "CRM",
          name,
          filtersJson: { search, ...filters },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...curr,
      ])
    }
    setIsSavingView(false)
  }

  const handleDeleteView = async (id: string) => {
    setIsDeletingViewId(id)
    const result = await deleteCrmViewAction(id)
    if (result.success) {
      toast.success("Visão removida.")
      setViewItems((curr) => curr.filter((v) => v.id !== id))
    }
    setIsDeletingViewId(null)
  }

  return (
    <div className="grid gap-6">
      <KanbanHeader
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={Object.keys(boardState.leadMap).length}
        filteredCount={visibleLeadIds.size}
        viewItems={viewItems}
        onApplyView={(v) => {
          const data = (v.filtersJson as Record<string, unknown>) || {}
          setSearch(String(data.search || ""))
          setFilters({
            source: (data.source as CRMFilters["source"]) || "all",
            stagnation: (data.stagnation as CRMFilters["stagnation"]) || "all",
            hasContact: (data.hasContact as CRMFilters["hasContact"]) || "all",
          })
        }}
        onDeleteView={handleDeleteView}
        onSaveView={handleSaveView}
        isSavingView={isSavingView}
        isDeletingViewId={isDeletingViewId}
        density={density}
        onDensityChange={async (d) => {
          setDensity(d)
          await saveCrmPreferencesAction({ density: d })
        }}
      />

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
                leadIds={filteredColumnMap[status]}
                leadMap={boardState.leadMap}
                dragDisabled={hasOpenDrawer}
                density={density}
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
