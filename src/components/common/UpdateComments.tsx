"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardUpdateComment } from "@/src/types/dashboard"
import {
  ChatCircleText,
  PaperPlaneTilt,
  UserCircle,
} from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { createUpdateCommentAction } from "@/src/lib/actions/project.actions"

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

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    const result = await createUpdateCommentAction({
      updateId,
      projectId,
      content,
    })

    if (result.success) {
      setContent("")
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
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isSubmitting || !content.trim()}
            onClick={handleSubmit}
            className="rounded-full px-5 text-[9px] font-black uppercase tracking-widest"
          >
            {isSubmitting ? "Enviando..." : "Enviar Comentario"}
            <PaperPlaneTilt weight="fill" className="ml-2 size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
