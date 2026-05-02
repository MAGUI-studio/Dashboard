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
import {
  ArrowsDownUp,
  CaretUpDown,
  Check,
  LinkSimple,
  Plus,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

import {
  createOwnMaguiConnectLinkAction,
  reorderOwnMaguiConnectLinksAction,
} from "@/src/lib/actions/maguiConnect.actions"
import { cn } from "@/src/lib/utils/utils"

import { MAGUI_CONNECT_LINK_KIND_PRESETS } from "@/src/config/magui-connect-presets"

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
  const [kind, setKind] = React.useState("LINK")
  const [isAdding, setIsAdding] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [openKind, setOpenKind] = React.useState(false)

  React.useEffect(() => {
    setItems((current) => {
      if (links.length < current.length) {
        return current
      }
      const currentIds = current.map((item) => item.id).join("|")
      const nextIds = links.map((item) => item.id).join("|")
      if (currentIds === nextIds) return current
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
      kind,
      isFeatured: false,
      openInNewTab: true,
    })
    setItems((current) => [...current, createdLink])
    router.refresh()
    setLabel("")
    setUrl("")
    setKind("LINK")
    setIsAdding(false)
  }

  return (
    <div className="max-w-4xl space-y-12 pt-16 border-t border-border/40">
      {!isAdding ? (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">
              {t("linksTitle")}
            </h3>
            <p className="text-sm text-muted-foreground/60">
              {t("linksDescription")}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {items.length > 1 ? (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                <ArrowsDownUp size={14} />
                {t("linksReorderHint")}
              </div>
            ) : null}

            <button
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-8 text-[11px] font-black uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-[0.98] shadow-xl shadow-black/10"
              type="button"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={18} weight="bold" />
              {t("addLink")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold tracking-tight">{t("addLink")}</h3>
            <div className="h-[1px] flex-1 bg-border/40" />
          </div>

          <div className="grid gap-10">
            <div className="grid gap-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                {t("linkLabel")}
              </Label>
              <Input
                autoFocus
                className="h-14 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-lg font-bold shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground focus-visible:ring-0 transition-all"
                placeholder="Ex: Meu Instagram"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="grid gap-12 sm:grid-cols-2">
              <div className="grid gap-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                  Tipo de Destino
                </Label>
                <Popover open={openKind} onOpenChange={setOpenKind}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      role="combobox"
                      aria-expanded={openKind}
                      className="h-12 w-full justify-between rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm font-bold shadow-none hover:bg-transparent hover:border-foreground transition-all"
                    >
                      {kind
                        ? MAGUI_CONNECT_LINK_KIND_PRESETS.find(
                            (p) => p.value === kind
                          )?.label
                        : "Selecione o tipo..."}
                      <CaretUpDown size={16} className="ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-0 rounded-2xl border-border/60 shadow-2xl"
                    align="start"
                  >
                    <Command className="rounded-2xl">
                      <CommandInput
                        placeholder="Pesquisar tipo..."
                        className="h-12"
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                        <CommandGroup>
                          {MAGUI_CONNECT_LINK_KIND_PRESETS.map((p) => (
                            <CommandItem
                              key={p.value}
                              value={p.label}
                              onSelect={() => {
                                setKind(p.value)
                                setOpenKind(false)
                              }}
                              className="flex items-center gap-3 py-3 px-4 text-xs font-bold"
                            >
                              <Check
                                size={16}
                                className={cn(
                                  "text-brand-primary",
                                  kind === p.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {p.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                  {t("linkUrl")}
                </Label>
                <Input
                  className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm font-mono shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground transition-all"
                  placeholder="https://instagram.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-4">
            <Button
              className="cursor-pointer rounded-full px-8 h-12 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/10"
              variant="ghost"
              onClick={() => {
                setIsAdding(false)
                setLabel("")
                setUrl("")
                setKind("LINK")
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer rounded-full bg-brand-primary px-10 h-12 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-brand-primary/20"
              onClick={handleAdd}
            >
              Confirmar
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
          <div className="grid gap-4">
            {items.length === 0 && !isAdding ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-32 text-center">
                <div className="h-20 w-20 rounded-full bg-muted/5 flex items-center justify-center text-muted-foreground/20 border border-border/40">
                  <LinkSimple size={40} weight="thin" />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-sm uppercase tracking-[0.3em] text-muted-foreground/60">
                    {t("noLinks")}
                  </p>
                  <p className="text-xs text-muted-foreground/30 font-medium">
                    {t("linksHelper")}
                  </p>
                </div>
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
            <div className="bg-background/80 backdrop-blur-2xl px-8 py-6 shadow-2xl rounded-3xl border border-brand-primary/20 scale-[1.05]">
              <div className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary">
                {items.find((item) => item.id === activeId)?.label}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
