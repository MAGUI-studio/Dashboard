"use client"

import { useTranslations } from "next-intl"

import { MaguiConnectLink } from "@/src/generated/client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  BehanceLogo,
  Briefcase,
  DotsSixVertical,
  DribbbleLogo,
  Envelope,
  GithubLogo,
  InstagramLogo,
  LinkSimple,
  LinkedinLogo,
  Phone,
  ShoppingBag,
  Star,
  Trash,
  WhatsappLogo,
  YoutubeLogo,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

import {
  deleteOwnMaguiConnectLinkAction,
  updateOwnMaguiConnectLinkAction,
} from "@/src/lib/actions/maguiConnect.actions"
import { cn } from "@/src/lib/utils/utils"

interface MaguiConnectLinkItemProps {
  link: MaguiConnectLink
}

const KIND_ICONS: Record<string, React.ElementType> = {
  LINK: LinkSimple,
  WHATSAPP: WhatsappLogo,
  INSTAGRAM: InstagramLogo,
  LINKEDIN: LinkedinLogo,
  EMAIL: Envelope,
  PHONE: Phone,
  PORTFOLIO: Briefcase,
  SHOP: ShoppingBag,
  YOUTUBE: YoutubeLogo,
  BEHANCE: BehanceLogo,
  DRIBBBLE: DribbbleLogo,
  GITHUB: GithubLogo,
}

export function MaguiConnectLinkItem({ link }: MaguiConnectLinkItemProps) {
  const t = useTranslations("MaguiConnect")
  const Icon = KIND_ICONS[link.kind] || LinkSimple

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

  const toggleFeatured = async () => {
    await updateOwnMaguiConnectLinkAction(link.id, {
      label: link.label,
      url: link.url,
      kind: link.kind,
      isFeatured: !link.isFeatured,
      openInNewTab: link.openInNewTab,
    })
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative transition-all rounded-2xl",
        isDragging && "z-50 scale-[1.01] opacity-50 bg-muted/20",
        link.isFeatured &&
          "bg-brand-primary/[0.03] border border-brand-primary/10"
      )}
      style={style}
    >
      <div className="flex items-center gap-4 py-4 px-2 transition-colors">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-muted-foreground/30 transition-colors hover:text-foreground active:cursor-grabbing"
          aria-label="Reorder"
        >
          <DotsSixVertical size={18} weight="bold" />
        </button>

        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-all",
            link.isFeatured
              ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary"
              : "border-border/60 text-muted-foreground"
          )}
        >
          <Icon size={18} weight={link.isFeatured ? "fill" : "regular"} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold">{link.label}</p>
            {link.isFeatured && (
              <span className="bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                Destaque
              </span>
            )}
          </div>
          <p className="truncate font-mono text-[9px] text-muted-foreground/60">
            {link.url}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            className={cn(
              "h-8 w-8 cursor-pointer rounded-full transition-all",
              link.isFeatured
                ? "text-brand-primary hover:bg-brand-primary/10"
                : "text-muted-foreground/30 hover:text-foreground hover:bg-muted/40"
            )}
            size="icon"
            variant="ghost"
            title="Destacar Link"
            onClick={toggleFeatured}
          >
            <Star size={16} weight={link.isFeatured ? "fill" : "regular"} />
          </Button>

          <Button
            className="h-8 w-8 cursor-pointer rounded-full text-muted-foreground/30 transition-all hover:bg-destructive/10 hover:text-destructive"
            size="icon"
            variant="ghost"
            title={t("deleteLink")}
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
    </div>
  )
}
