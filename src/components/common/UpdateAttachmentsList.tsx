"use client"

import * as React from "react"

import { DashboardUpdateAttachment } from "@/src/types/dashboard"
import {
  CaretLeft,
  CaretRight,
  File,
  FilePdf,
  Image as ImageIcon,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog"

function formatBytes(size: number | null): string | null {
  if (!size) {
    return null
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function AttachmentIcon({
  attachment,
}: {
  attachment: DashboardUpdateAttachment
}): React.JSX.Element {
  if (attachment.type === "IMAGE") {
    return <ImageIcon weight="duotone" className="size-4" />
  }

  if (attachment.mimeType === "application/pdf") {
    return <FilePdf weight="duotone" className="size-4" />
  }

  return <File weight="duotone" className="size-4" />
}

interface UpdateAttachmentsListProps {
  attachments?: DashboardUpdateAttachment[]
  compact?: boolean
}

export function UpdateAttachmentsList({
  attachments = [],
  compact = false,
}: UpdateAttachmentsListProps): React.JSX.Element | null {
  const imageAttachments = React.useMemo(
    () => attachments.filter((attachment) => attachment.type === "IMAGE"),
    [attachments]
  )
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false)
  const [activeImageIndex, setActiveImageIndex] = React.useState(0)

  if (attachments.length === 0) {
    return null
  }

  const activeImage = imageAttachments[activeImageIndex]

  const openGallery = (attachmentId: string) => {
    const nextIndex = imageAttachments.findIndex(
      (attachment) => attachment.id === attachmentId
    )

    setActiveImageIndex(nextIndex >= 0 ? nextIndex : 0)
    setIsGalleryOpen(true)
  }

  const showPreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? imageAttachments.length - 1 : currentIndex - 1
    )
  }

  const showNextImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === imageAttachments.length - 1 ? 0 : currentIndex + 1
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {attachments.map((attachment) => {
          const itemClassName = `group flex items-center gap-3 rounded-2xl border border-border/30 bg-background/40 transition-all hover:border-brand-primary/30 hover:bg-brand-primary/5 ${
            compact ? "p-3" : "p-4"
          }`

          if (attachment.type === "IMAGE") {
            return (
              <button
                key={attachment.id}
                type="button"
                onClick={() => openGallery(attachment.id)}
                className={`${itemClassName} text-left`}
              >
                <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-primary/10 text-brand-primary">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="size-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-black uppercase tracking-tight text-foreground/85 group-hover:text-brand-primary">
                    {attachment.name}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Visualizar imagem
                    {formatBytes(attachment.size)
                      ? ` • ${formatBytes(attachment.size)}`
                      : ""}
                  </span>
                </div>
              </button>
            )
          }

          return (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClassName}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <AttachmentIcon attachment={attachment} />
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-black uppercase tracking-tight text-foreground/85 group-hover:text-brand-primary">
                  {attachment.name}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {attachment.mimeType ?? "Arquivo"}
                  {formatBytes(attachment.size)
                    ? ` • ${formatBytes(attachment.size)}`
                    : ""}
                </span>
              </div>
            </a>
          )
        })}
      </div>

      {activeImage && (
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent
            showCloseButton={false}
            className="left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 border-none bg-transparent p-0 shadow-none ring-0"
          >
            <DialogTitle className="sr-only">Galeria de imagens</DialogTitle>

            <div className="relative flex h-[100svh] w-screen items-center justify-center bg-black/92 p-4 sm:p-8">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-20 size-11 rounded-full bg-background/85 backdrop-blur"
                onClick={() => setIsGalleryOpen(false)}
              >
                <X weight="bold" className="size-5" />
              </Button>

              {imageAttachments.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 z-20 size-11 -translate-y-1/2 rounded-full bg-background/85 backdrop-blur"
                  onClick={showPreviousImage}
                >
                  <CaretLeft weight="bold" className="size-5" />
                </Button>
              )}

              <img
                src={activeImage.url}
                alt={activeImage.name}
                className="max-h-[70svh] w-auto max-w-[70vw] object-contain"
              />

              {imageAttachments.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 z-20 size-11 -translate-y-1/2 rounded-full bg-background/85 backdrop-blur"
                  onClick={showNextImage}
                >
                  <CaretRight weight="bold" className="size-5" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
