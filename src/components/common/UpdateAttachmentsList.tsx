"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"

import { DashboardUpdateAttachment } from "@/src/types/dashboard"
import {
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  File,
  FilePdf,
  Image as ImageIcon,
  X,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"

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
  const t = useTranslations("Dashboard.attachments")
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
        {attachments.map((attachment, index) => {
          const itemClassName = `group flex cursor-pointer items-center gap-3 rounded-2xl bg-muted/20 transition-all hover:bg-muted/32 ${
            compact ? "p-3" : "p-4"
          }`

          if (attachment.type === "IMAGE") {
            return (
              <motion.button
                key={attachment.id}
                type="button"
                onClick={() => openGallery(attachment.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.04, duration: 0.35 }}
                whileHover={{ y: -2, transition: { duration: 0.18 } }}
                className={`${itemClassName} text-left`}
              >
                <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Image
                    src={attachment.url}
                    alt={attachment.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-black uppercase tracking-tight text-foreground/85">
                    {attachment.name}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {t("open_image")}
                    {formatBytes(attachment.size)
                      ? ` • ${formatBytes(attachment.size)}`
                      : ""}
                  </span>
                </div>

                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background/80 text-muted-foreground/45 transition-all group-hover:text-brand-primary">
                  <ArrowSquareOut weight="bold" className="size-4" />
                </div>
              </motion.button>
            )
          }

          return (
            <motion.a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.04, duration: 0.35 }}
              whileHover={{ y: -2, transition: { duration: 0.18 } }}
              className={itemClassName}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <AttachmentIcon attachment={attachment} />
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-black uppercase tracking-tight text-foreground/85">
                  {attachment.name}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {t("open_file")}
                  {formatBytes(attachment.size)
                    ? ` • ${formatBytes(attachment.size)}`
                    : ""}
                </span>
              </div>

              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background/80 text-muted-foreground/45 transition-all group-hover:text-brand-primary">
                <ArrowSquareOut weight="bold" className="size-4" />
              </div>
            </motion.a>
          )
        })}
      </div>

      {activeImage && (
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent
            showCloseButton={false}
            className="left-0 top-0 h-full w-full max-w-none translate-x-0 translate-y-0 border-none bg-transparent p-0 shadow-none ring-0"
          >
            <DialogTitle className="sr-only">
              {t("image_gallery_title")}
            </DialogTitle>

            <div className="relative flex h-full w-full items-center justify-center bg-black/92 p-4 sm:p-8">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-4 top-4 z-20 size-11 rounded-full bg-background/85 backdrop-blur"
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

              <div className="relative flex h-[70svh] w-full max-w-4xl items-center justify-center">
                <Image
                  src={activeImage.url}
                  alt={activeImage.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

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
