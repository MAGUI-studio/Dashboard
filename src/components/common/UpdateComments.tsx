"use client"

import * as React from "react"

import { AssetType } from "@/src/generated/client/enums"
import { DashboardUpdateComment } from "@/src/types/dashboard"
import {
  ChatCircleText,
  File,
  PaperPlaneTilt,
  Paperclip,
  UserCircle,
  X,
} from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { createUpdateCommentAction } from "@/src/lib/actions/project.actions"
import { useUploadThing } from "@/src/lib/uploadthing"

import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

interface UpdateCommentsProps {
  updateId: string
  projectId: string
  comments: DashboardUpdateComment[]
}

export function UpdateComments({
  updateId,
  projectId,
  comments,
}: UpdateCommentsProps): React.JSX.Element {
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { startUpload, isUploading } = useUploadThing("projectAsset")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return
    setSelectedFiles((current) => [
      ...current,
      ...Array.from(event.target.files ?? []),
    ])
    event.target.value = ""
  }

  const removeFile = (file: File) => {
    setSelectedFiles((current) =>
      current.filter(
        (item) =>
          !(item.name === file.name && item.lastModified === file.lastModified)
      )
    )
  }

  const getAttachmentType = (file: File): AssetType =>
    file.type.startsWith("image/") ? AssetType.IMAGE : AssetType.DOCUMENT

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return

    setIsSubmitting(true)
    let result: Awaited<ReturnType<typeof createUpdateCommentAction>>

    try {
      const uploads = selectedFiles.length
        ? await startUpload(selectedFiles, {
            projectId,
            scope: "comments",
          } as never)
        : []

      if (selectedFiles.length && !uploads) {
        throw new Error("Upload interrompido")
      }

      result = await createUpdateCommentAction({
        updateId,
        projectId,
        content: content.trim() || "Arquivo enviado.",
        attachments:
          uploads?.map((file, index) => ({
            name: file.name,
            url: file.ufsUrl,
            key: file.key,
            customId: file.customId ?? null,
            type: getAttachmentType(selectedFiles[index]),
            mimeType: file.type,
            size: file.size,
          })) ?? [],
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro no upload.")
      setIsSubmitting(false)
      return
    }

    if (result.success) {
      setContent("")
      setSelectedFiles([])
      toast.success("Comentario enviado.")
    } else {
      toast.error(result.error || "Erro ao enviar comentario.")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-border/10 pb-4">
        <ChatCircleText
          weight="duotone"
          className="size-5 text-brand-primary"
        />
        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Conversa sobre esta entrega
        </h5>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
            Nenhum comentario ainda.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/20">
                <UserCircle
                  weight="fill"
                  className="size-6 text-muted-foreground/40"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-tight text-foreground/80">
                    {comment.author?.name || "Usuario"}
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground/40">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground/80">
                  {comment.content}
                </p>
                {comment.attachments?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {comment.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground/70 transition-colors hover:text-brand-primary"
                      >
                        <File weight="duotone" className="size-3.5" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-muted/10 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva sua duvida ou feedback..."
          className="min-h-[80px] resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
        {selectedFiles.length ? (
          <div className="grid gap-2">
            {selectedFiles.map((file) => (
              <div
                key={`${file.name}-${file.lastModified}`}
                className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2"
              >
                <span className="truncate text-[10px] font-bold text-muted-foreground/70">
                  {file.name}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 rounded-full"
                  onClick={() => removeFile(file)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full px-4 text-[9px] font-black uppercase tracking-widest"
          >
            <Paperclip weight="bold" className="mr-2 size-3.5" />
            Anexar
          </Button>
          <Button
            size="sm"
            disabled={
              isSubmitting ||
              isUploading ||
              (!content.trim() && selectedFiles.length === 0)
            }
            onClick={handleSubmit}
            className="rounded-full px-5 text-[9px] font-black uppercase tracking-widest"
          >
            {isSubmitting || isUploading ? "Enviando..." : "Enviar Comentario"}
            <PaperPlaneTilt weight="fill" className="ml-2 size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
