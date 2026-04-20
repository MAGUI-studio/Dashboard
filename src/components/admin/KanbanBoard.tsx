"use client"

import * as React from "react"

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  InstagramLogo,
  MagnifyingGlass,
  NotePencil,
  Phone,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { LeadStatus } from "@/src/generated/client/enums"
import { updateLeadStatus } from "@/src/lib/actions/crm.actions"
import {
  CRM_STATUS_ORDER,
  LEAD_STATUS_STYLES,
  getLeadDaysWithoutMovement,
  isLeadStagnant,
} from "@/src/lib/utils/crm"
import { Lead } from "@/src/types/crm"

import { LeadDetailsDrawer } from "@/src/components/admin/LeadDetailsDrawer"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

type LeadMap = Record<string, Lead>
type ColumnMap = Record<LeadStatus, string[]>

function buildBoardState(leads: Lead[]): { leadMap: LeadMap; columnMap: ColumnMap } {
  const orderedLeads = [...leads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const leadMap = orderedLeads.reduce<LeadMap>((acc, lead) => {
    acc[lead.id] = lead
    return acc
  }, {})

  const columnMap = CRM_STATUS_ORDER.reduce<ColumnMap>((acc, status) => {
    acc[status] = orderedLeads
      .filter((lead) => lead.status === status)
      .map((lead) => lead.id)
    return acc
  }, {} as ColumnMap)

  return { leadMap, columnMap }
}

function findContainer(id: string, columnMap: ColumnMap): LeadStatus | undefined {
  if (CRM_STATUS_ORDER.includes(id as LeadStatus)) {
    return id as LeadStatus
  }

  return CRM_STATUS_ORDER.find((status) => columnMap[status].includes(id))
}

function moveLeadBetweenColumns(params: {
  activeId: string
  activeContainer: LeadStatus
  overContainer: LeadStatus
  overId: string
  current: { leadMap: LeadMap; columnMap: ColumnMap }
}): { leadMap: LeadMap; columnMap: ColumnMap } {
  const { activeId, activeContainer, overContainer, overId, current } = params
  const activeItems = current.columnMap[activeContainer]
  const overItems = current.columnMap[overContainer]
  const overIndex =
    overId === overContainer ? overItems.length : overItems.indexOf(overId)

  const nextIndex = overIndex < 0 ? overItems.length : overIndex

  return {
    leadMap: {
      ...current.leadMap,
      [activeId]: {
        ...current.leadMap[activeId],
        status: overContainer,
      },
    },
    columnMap: {
      ...current.columnMap,
      [activeContainer]: activeItems.filter((id) => id !== activeId),
      [overContainer]: [
        ...overItems.slice(0, nextIndex),
        activeId,
        ...overItems.slice(nextIndex),
      ],
    },
  }
}

function LeadCard({
  lead,
  dragging = false,
  dragAttributes,
  dragListeners,
  dragRef,
  dragStyle,
  onDrawerOpenChange,
}: {
  lead: Lead
  dragging?: boolean
  dragAttributes?: DraggableAttributes
  dragListeners?: Record<string, unknown>
  dragRef?: (node: HTMLElement | null) => void
  dragStyle?: React.CSSProperties
  onDrawerOpenChange?: (open: boolean) => void
}): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const stagnant = isLeadStagnant(lead)

  return (
    <motion.article
      ref={dragRef}
      layout
      style={dragStyle}
      {...dragAttributes}
      {...(dragListeners ?? {})}
      className={`group rounded-[1.5rem] border bg-background/95 p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] transition-all ${
        stagnant
          ? "border-amber-500/25"
          : "border-border/50 hover:border-border/70"
      } ${
        dragging
          ? "cursor-grabbing opacity-90 shadow-[0_32px_80px_-38px_rgba(15,23,42,0.55)]"
          : "cursor-grab"
      }`}
    >
      <div className="min-w-0 space-y-2">
        <p className="truncate text-base font-black tracking-tight text-foreground">
          {lead.companyName}
        </p>
        {lead.contactName ? (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/55">
            {lead.contactName}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-border/35 bg-muted/10 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">
            {t(`source.${lead.source}`)}
          </span>
          {stagnant ? (
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              {getLeadDaysWithoutMovement(lead)}d parado
            </span>
          ) : null}
        </div>

        {lead.instagram || lead.phone ? (
          <div className="grid gap-2 text-sm text-foreground/80">
            {lead.instagram ? (
              <div className="flex items-center gap-2 truncate">
                <InstagramLogo
                  size={14}
                  className="shrink-0 text-muted-foreground/55"
                />
                <span className="truncate">{lead.instagram}</span>
              </div>
            ) : null}
            {lead.phone ? (
              <div className="flex items-center gap-2 truncate">
                <Phone size={14} className="shrink-0 text-muted-foreground/55" />
                <span className="truncate">{lead.phone}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
          <NotePencil size={12} />
          {lead.followUpNotes.length} nota(s)
        </span>

        <LeadDetailsDrawer lead={lead} onOpenChange={onDrawerOpenChange}>
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.2em]"
            onPointerDown={(event) => event.stopPropagation()}
          >
            Abrir
          </Button>
        </LeadDetailsDrawer>
      </div>
    </motion.article>
  )
}

function SortableLeadCardWithDrawerState({
  lead,
  dragDisabled,
  onDrawerOpenChange = () => undefined,
}: {
  lead: Lead
  dragDisabled: boolean
  onDrawerOpenChange?: (open: boolean) => void
}): React.JSX.Element {
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

  return (
    <LeadCard
      lead={lead}
      dragging={isDragging}
      dragAttributes={dragDisabled ? undefined : attributes}
      dragListeners={dragDisabled ? undefined : listeners}
      dragRef={setNodeRef}
      dragStyle={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onDrawerOpenChange={onDrawerOpenChange}
    />
  )
}

function KanbanColumn({
  status,
  leadIds,
  leadMap,
  dragDisabled,
  onDrawerOpenChange,
}: {
  status: LeadStatus
  leadIds: string[]
  leadMap: LeadMap
  dragDisabled: boolean
  onDrawerOpenChange: (open: boolean) => void
}): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const leads = leadIds.map((id) => leadMap[id]).filter(Boolean)

  return (
    <motion.section
      ref={setNodeRef}
      layout
      className={`flex min-h-[32rem] flex-col rounded-[1.9rem] border p-4 ${LEAD_STATUS_STYLES[status].column} ${
        isOver ? "ring-2 ring-brand-primary/20" : ""
      }`}
    >
      <div className="rounded-[1.4rem] border border-border/35 bg-background/80 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p
              className={`text-[10px] font-black uppercase tracking-[0.24em] ${LEAD_STATUS_STYLES[status].accent}`}
            >
              {t(`status.${status}`)}
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {leads.length}
            </p>
          </div>
        </div>
      </div>

      <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
        <div className="mt-4 grid flex-1 content-start gap-3">
          {leads.map((lead) => (
            <SortableLeadCardWithDrawerState
              key={lead.id}
              lead={lead}
              dragDisabled={dragDisabled}
              onDrawerOpenChange={onDrawerOpenChange}
            />
          ))}

          {leads.length === 0 ? (
            <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed border-border/40 bg-background/50 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              Arraste um lead para ca
            </div>
          ) : null}
        </div>
      </SortableContext>
    </motion.section>
  )
}

export function KanbanBoard({ leads }: { leads: Lead[] }): React.JSX.Element {
  const [search, setSearch] = React.useState("")
  const [boardState, setBoardState] = React.useState(() => buildBoardState(leads))
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null)
  const [hasOpenDrawer, setHasOpenDrawer] = React.useState(false)
  const lastCommittedStatusRef = React.useRef<LeadStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  )

  React.useEffect(() => {
    setBoardState(buildBoardState(leads))
  }, [leads])

  const { leadMap, columnMap } = boardState

  const visibleLeadIds = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return new Set(Object.keys(leadMap))
    }

    return new Set(
      Object.values(leadMap)
        .filter((lead) => {
          const haystack = [
            lead.companyName,
            lead.contactName ?? "",
            lead.email ?? "",
            lead.instagram ?? "",
            lead.phone ?? "",
          ]

          return haystack.some((value) => value.toLowerCase().includes(query))
        })
        .map((lead) => lead.id)
    )
  }, [leadMap, search])

  const filteredColumnMap = React.useMemo(
    () =>
      CRM_STATUS_ORDER.reduce<Record<LeadStatus, string[]>>((acc, status) => {
        acc[status] = columnMap[status].filter((id) => visibleLeadIds.has(id))
        return acc
      }, {} as Record<LeadStatus, string[]>),
    [columnMap, visibleLeadIds]
  )

  const activeLead = activeLeadId ? leadMap[activeLeadId] : null

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveLeadId(String(event.active.id))
    const currentLead = leadMap[String(event.active.id)]
    lastCommittedStatusRef.current = currentLead?.status ?? null
  }

  const handleDragOver = (event: DragOverEvent): void => {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null

    if (!overId) return

    const activeContainer = findContainer(activeId, boardState.columnMap)
    const overContainer = findContainer(overId, boardState.columnMap)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    setBoardState((current) =>
      moveLeadBetweenColumns({
        activeId,
        activeContainer,
        overContainer,
        overId,
        current,
      })
    )
  }

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    setActiveLeadId(null)

    if (!overId) {
      setBoardState(buildBoardState(leads))
      return
    }

    const activeContainer = findContainer(activeId, boardState.columnMap)
    const overContainer = findContainer(overId, boardState.columnMap)

    if (!activeContainer || !overContainer) {
      setBoardState(buildBoardState(leads))
      return
    }

    if (activeContainer === overContainer) {
      const activeIndex = boardState.columnMap[activeContainer].indexOf(activeId)
      const overIndex =
        overId === overContainer
          ? boardState.columnMap[activeContainer].length - 1
          : boardState.columnMap[activeContainer].indexOf(overId)

      if (activeIndex !== overIndex && overIndex >= 0) {
        setBoardState((current) => ({
          ...current,
          columnMap: {
            ...current.columnMap,
            [activeContainer]: arrayMove(
              current.columnMap[activeContainer],
              activeIndex,
              overIndex
            ),
          },
        }))
      }

      return
    }

    const previousStatus = lastCommittedStatusRef.current
    if (!previousStatus || previousStatus === overContainer) {
      return
    }

    const result = await updateLeadStatus(activeId, overContainer)

    if (!result.success) {
      setBoardState(buildBoardState(leads))
      toast.error("Nao foi possivel mover o lead.")
      return
    }

    toast.success("Lead movido.")
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/55" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar empresa, contato, telefone ou Instagram..."
            className="h-12 rounded-full border-border/60 bg-background/80 pl-11"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {CRM_STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leadIds={filteredColumnMap[status]}
              leadMap={leadMap}
              dragDisabled={hasOpenDrawer}
              onDrawerOpenChange={setHasOpenDrawer}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
