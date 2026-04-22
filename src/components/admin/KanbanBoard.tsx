"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"

import { LeadStatus } from "@/src/generated/client/enums"
import { Lead, MessageTemplate, SavedView } from "@/src/types/crm"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DraggableAttributes,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
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
  Star,
  Trash,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

import { LeadDetailsDrawer } from "@/src/components/admin/LeadDetailsDrawer"

import {
  deleteCrmViewAction,
  saveCrmPreferencesAction,
  saveCrmViewAction,
  updateLeadStatus,
} from "@/src/lib/actions/crm.actions"
import {
  CRM_STATUS_ORDER,
  LEAD_STATUS_STYLES,
  getLeadDaysWithoutMovement,
  isLeadStagnant,
} from "@/src/lib/utils/crm"

import { CRMFilters, KanbanFilters } from "./KanbanFilters"

type LeadMap = Record<string, Lead>
type ColumnMap = Record<LeadStatus, string[]>

function buildBoardState(leads: Lead[]): {
  leadMap: LeadMap
  columnMap: ColumnMap
} {
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

function findContainer(
  id: string,
  columnMap: ColumnMap
): LeadStatus | undefined {
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
  density = "comfortable",
  dragging = false,
  dragAttributes,
  dragListeners,
  dragRef,
  dragStyle,
  onDrawerOpenChange,
  open,
  clients,
  templates,
}: {
  lead: Lead
  density?: "comfortable" | "compact"
  dragging?: boolean
  dragAttributes?: DraggableAttributes
  dragListeners?: Record<string, unknown>
  dragRef?: (node: HTMLElement | null) => void
  dragStyle?: React.CSSProperties
  onDrawerOpenChange?: (open: boolean) => void
  open?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
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

      <div
        className={`mt-4 grid rounded-[1.25rem] border border-border/35 bg-muted/10 ${
          density === "compact" ? "gap-2 p-3" : "gap-3 p-3.5"
        }`}
      >
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
                <Phone
                  size={14}
                  className="shrink-0 text-muted-foreground/55"
                />
                <span className="truncate">{lead.phone}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={`flex items-center justify-between gap-3 ${
          density === "compact" ? "mt-3" : "mt-4"
        }`}
      >
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
          <NotePencil size={12} />
          {lead.followUpNotes?.length || 0} nota(s)
        </span>

        <LeadDetailsDrawer
          lead={lead}
          onOpenChange={onDrawerOpenChange}
          open={open}
          clients={clients}
          templates={templates}
        >
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
  density,
  onDrawerOpenChange = () => undefined,
  isOpen = false,
  clients,
  templates,
}: {
  lead: Lead
  dragDisabled: boolean
  density: "comfortable" | "compact"
  onDrawerOpenChange?: (leadId: string, open: boolean) => void
  isOpen?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
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
      density={density}
      dragging={isDragging}
      dragAttributes={dragDisabled ? undefined : attributes}
      dragListeners={dragDisabled ? undefined : listeners}
      dragRef={setNodeRef}
      dragStyle={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onDrawerOpenChange={(open) => onDrawerOpenChange(lead.id, open)}
      open={isOpen}
      clients={clients}
      templates={templates}
    />
  )
}

function KanbanColumn({
  status,
  leadIds,
  leadMap,
  dragDisabled,
  density,
  onDrawerOpenChange,
  selectedLeadId,
  clients,
  templates,
}: {
  status: LeadStatus
  leadIds: string[]
  leadMap: LeadMap
  dragDisabled: boolean
  density: "comfortable" | "compact"
  onDrawerOpenChange: (leadId: string, open: boolean) => void
  selectedLeadId: string | null
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
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
              density={density}
              onDrawerOpenChange={onDrawerOpenChange}
              isOpen={selectedLeadId === lead.id}
              clients={clients}
              templates={templates}
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
}): React.JSX.Element {
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<CRMFilters>({
    source: "all",
    stagnation: "all",
    hasContact: "all",
  })
  const [boardState, setBoardState] = React.useState(() =>
    buildBoardState(leads)
  )
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null)
  const [hasOpenDrawer, setHasOpenDrawer] = React.useState(false)
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(
    initialLeadId
  )
  const [viewName, setViewName] = React.useState("")
  const [isSavingView, setIsSavingView] = React.useState(false)
  const [isDeletingViewId, setIsDeletingViewId] = React.useState<string | null>(
    null
  )
  const [density, setDensity] = React.useState(preferences.density)
  const lastCommittedStatusRef = React.useRef<LeadStatus | null>(null)
  const router = useRouter()
  const pathname = usePathname()

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

  React.useEffect(() => {
    if (!initialLeadId) {
      const storedLeadId = window.sessionStorage.getItem("crm-open-lead")

      if (!storedLeadId) {
        return
      }

      const hasStoredLead = leads.some((lead) => lead.id === storedLeadId)

      if (hasStoredLead) {
        setSelectedLeadId(storedLeadId)
        setHasOpenDrawer(true)
      }

      window.sessionStorage.removeItem("crm-open-lead")
      return
    }

    const hasMatchingLead = leads.some((lead) => lead.id === initialLeadId)

    if (hasMatchingLead) {
      setSelectedLeadId(initialLeadId)
      setHasOpenDrawer(true)
    }
  }, [initialLeadId, leads])

  const { leadMap, columnMap } = boardState

  const visibleLeadIds = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    return new Set(
      Object.values(leadMap)
        .filter((lead) => {
          // 1. Text Search
          if (query) {
            const haystack = [
              lead.companyName,
              lead.contactName ?? "",
              lead.email ?? "",
              lead.instagram ?? "",
              lead.phone ?? "",
            ]
            if (
              !haystack.some((value) => value.toLowerCase().includes(query))
            ) {
              return false
            }
          }

          // 2. Source Filter
          if (filters.source !== "all" && lead.source !== filters.source) {
            return false
          }

          // 3. Stagnation Filter
          if (filters.stagnation !== "all") {
            const days = getLeadDaysWithoutMovement(lead)
            if (days < parseInt(filters.stagnation)) {
              return false
            }
          }

          // 4. Contact Filter
          if (filters.hasContact !== "all") {
            if (filters.hasContact === "phone" && !lead.phone) return false
            if (filters.hasContact === "instagram" && !lead.instagram)
              return false
            if (filters.hasContact === "email" && !lead.email) return false
          }

          return true
        })
        .map((lead) => lead.id)
    )
  }, [leadMap, search, filters])

  const filteredColumnMap = React.useMemo(
    () =>
      CRM_STATUS_ORDER.reduce<Record<LeadStatus, string[]>>(
        (acc, status) => {
          acc[status] = columnMap[status].filter((id) => visibleLeadIds.has(id))
          return acc
        },
        {} as Record<LeadStatus, string[]>
      ),
    [columnMap, visibleLeadIds]
  )

  const activeLead = activeLeadId ? leadMap[activeLeadId] : null

  const handleSaveView = async (): Promise<void> => {
    const name = viewName.trim()

    if (!name) {
      toast.error("Nome da visão obrigatório.")
      return
    }

    setIsSavingView(true)
    const result = await saveCrmViewAction({
      name,
      filters: {
        search,
        ...filters,
      },
    })

    if (result.success) {
      toast.success("Visão salva.")
      setViewName("")
      router.refresh()
    } else {
      toast.error(result.error ?? "Não foi possível salvar visão.")
    }

    setIsSavingView(false)
  }

  const handleApplyView = (view: SavedView): void => {
    const data = view.filtersJson

    setSearch(typeof data.search === "string" ? data.search : "")
    setFilters({
      source:
        typeof data.source === "string"
          ? (data.source as CRMFilters["source"])
          : "all",
      stagnation:
        typeof data.stagnation === "string"
          ? (data.stagnation as CRMFilters["stagnation"])
          : "all",
      hasContact:
        typeof data.hasContact === "string"
          ? (data.hasContact as CRMFilters["hasContact"])
          : "all",
    })
  }

  const handleDeleteView = async (id: string): Promise<void> => {
    setIsDeletingViewId(id)
    const result = await deleteCrmViewAction(id)

    if (result.success) {
      toast.success("Visão removida.")
      router.refresh()
    } else {
      toast.error(result.error ?? "Não foi possível remover visão.")
    }

    setIsDeletingViewId(null)
  }

  const handleDensityChange = async (
    nextDensity: "comfortable" | "compact"
  ): Promise<void> => {
    setDensity(nextDensity)
    const result = await saveCrmPreferencesAction({ density: nextDensity })

    if (!result.success) {
      toast.error("Não foi possível salvar preferência.")
    }
  }

  const handleDrawerOpenChange = React.useCallback(
    (leadId: string, open: boolean) => {
      setHasOpenDrawer(open)
      setSelectedLeadId(open ? leadId : null)
      if (!open) {
        window.sessionStorage.removeItem("crm-open-lead")
      }

      if (!open && initialLeadId) {
        router.replace(pathname, { scroll: false })
      }
    },
    [initialLeadId, pathname, router]
  )

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

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
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
      const activeIndex =
        boardState.columnMap[activeContainer].indexOf(activeId)
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <KanbanFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={leads.length}
          filteredCount={visibleLeadIds.size}
        />
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

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/30 bg-background/55 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
            <Star weight="duotone" className="size-4 text-brand-primary" />
            Visões salvas
          </span>
          {savedViews.length ? (
            savedViews.map((view) => (
              <div
                key={view.id}
                className="inline-flex items-center overflow-hidden rounded-full border border-border/35 bg-muted/10"
              >
                <button
                  type="button"
                  onClick={() => handleApplyView(view)}
                  className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:text-brand-primary"
                >
                  {view.name}
                </button>
                <button
                  type="button"
                  disabled={isDeletingViewId === view.id}
                  onClick={() => handleDeleteView(view.id)}
                  className="border-l border-border/30 px-2 py-2 text-muted-foreground/45 transition-colors hover:text-destructive"
                  aria-label={`Remover visão ${view.name}`}
                >
                  <Trash weight="duotone" className="size-3.5" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-xs font-medium text-muted-foreground/50">
              Nenhuma visão salva.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="inline-flex rounded-full border border-border/35 bg-muted/10 p-1">
            {(["comfortable", "compact"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleDensityChange(item)}
                className={`rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${
                  density === item
                    ? "bg-foreground text-background"
                    : "text-muted-foreground/65 hover:text-foreground"
                }`}
              >
                {item === "comfortable" ? "Conforto" : "Compacto"}
              </button>
            ))}
          </div>
          <Input
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            placeholder="Nome da visão"
            className="h-10 min-w-56 rounded-full border-border/50 bg-background/80"
          />
          <Button
            type="button"
            onClick={handleSaveView}
            disabled={isSavingView}
            className="h-10 rounded-full px-5 text-[9px] font-black uppercase tracking-[0.18em]"
          >
            {isSavingView ? "Salvando" : "Salvar filtros"}
          </Button>
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
              density={density}
              onDrawerOpenChange={handleDrawerOpenChange}
              selectedLeadId={selectedLeadId}
              clients={clients}
              templates={templates}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <LeadCard
              lead={activeLead}
              density={density}
              dragging
              clients={clients}
              templates={templates}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
