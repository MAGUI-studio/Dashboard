"use client"

import { useTranslations } from "next-intl"

import { MaguiConnectLink } from "@/src/generated/client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DotsSixVertical, LinkSimple, Trash } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

import { deleteOwnMaguiConnectLinkAction } from "@/src/lib/actions/maguiConnect.actions"
import { cn } from "@/src/lib/utils/utils"

interface MaguiConnectLinkItemProps {
  link: MaguiConnectLink
}

export function MaguiConnectLinkItem({ link }: MaguiConnectLinkItemProps) {
  const t = useTranslations("MaguiConnect")

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative transition-all",
        isDragging && "z-50 scale-[1.01] opacity-50"
      )}
      style={style}
    >
      <div className="flex items-center gap-4 border-b border-border/60 py-4 transition-colors">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-muted-foreground/40 transition-colors hover:text-foreground active:cursor-grabbing"
          aria-label="Reorder"
        >
          <DotsSixVertical size={18} weight="bold" />
        </button>

        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground">
          <LinkSimple size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{link.label}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground opacity-60">
            {link.url}
          </p>
        </div>

        <Button
          className="h-9 w-9 cursor-pointer rounded-full text-muted-foreground/45 transition-colors hover:bg-destructive/10 hover:text-destructive"
          size="icon"
          variant="ghost"
          onClick={() => {
            if (confirm(t("confirmDelete"))) {
              deleteOwnMaguiConnectLinkAction(link.id)
            }
          }}
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  )
}
