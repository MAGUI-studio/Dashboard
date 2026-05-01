"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { MaguiConnectLink } from "@/src/generated/client"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ArrowsDownUp, Plus } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

import {
  createOwnMaguiConnectLinkAction,
  reorderOwnMaguiConnectLinksAction,
} from "@/src/lib/actions/maguiConnect.actions"

import { MaguiConnectLinkItem } from "./MaguiConnectLinkItem"

interface MaguiConnectLinkListProps {
  links: MaguiConnectLink[]
}

export function MaguiConnectLinkList({ links }: MaguiConnectLinkListProps) {
  const t = useTranslations("MaguiConnect")
  const router = useRouter()
  const [items, setItems] = React.useState(links)
  const [label, setLabel] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setItems((current) => {
      if (links.length < current.length) {
        return current
      }

      const currentIds = current.map((item) => item.id).join("|")
      const nextIds = links.map((item) => item.id).join("|")

      if (currentIds === nextIds) {
        return current
      }

      return links
    })
  }, [links])

  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    const nextItems = arrayMove(items, oldIndex, newIndex)
    setItems(nextItems)
    await reorderOwnMaguiConnectLinksAction(nextItems.map((item) => item.id))
  }

  const handleAdd = async () => {
    if (!label || !url) return
    const createdLink = await createOwnMaguiConnectLinkAction({
      label,
      url,
    })
    setItems((current) => [...current, createdLink])
    router.refresh()
    setLabel("")
    setUrl("")
    setIsAdding(false)
  }

  return (
    <div className="space-y-6">
      {!isAdding ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[11px] font-black uppercase tracking-[0.18em] text-background transition-all hover:opacity-90"
            type="button"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={18} weight="bold" />
            {t("addLink")}
          </button>

          {items.length > 1 ? (
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/65">
              <ArrowsDownUp size={14} />
              {t("linksReorderHint")}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5 border-b border-border/60 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              autoFocus
              className="h-12 rounded-none border-0 border-b border-border/70 bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0"
              placeholder={t("linkLabel")}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Input
              className="h-12 rounded-none border-0 border-b border-border/70 bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0"
              placeholder={t("linkUrl")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              className="rounded-full px-5 text-[11px] font-black uppercase tracking-[0.18em]"
              variant="ghost"
              onClick={() => setIsAdding(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              className="rounded-full bg-foreground px-5 text-[11px] font-black uppercase tracking-[0.18em] text-background hover:bg-foreground/90"
              onClick={handleAdd}
            >
              {t("addLink")}
            </Button>
          </div>
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.length === 0 && !isAdding ? (
              <div className="flex flex-col items-center justify-center space-y-3 border-b border-border/60 px-6 py-14 text-center">
                <p className="font-bold text-muted-foreground">
                  {t("noLinks")}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {t("linksHelper")}
                </p>
              </div>
            ) : (
              items.map((link) => (
                <MaguiConnectLinkItem key={link.id} link={link} />
              ))
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="border border-border/60 bg-background px-5 py-4 shadow-2xl">
              <div className="text-sm font-bold">
                {items.find((item) => item.id === activeId)?.label}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
