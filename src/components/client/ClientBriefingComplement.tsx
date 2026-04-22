"use client"

import * as React from "react"

import { DashboardBriefingEntry } from "@/src/types/dashboard"
import { ClockCountdown, Plus } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

import { addBriefingNoteAction } from "@/src/lib/actions/project.actions"

interface ClientBriefingComplementProps {
  projectId: string
  notes: DashboardBriefingEntry[]
}

export function ClientBriefingComplement({
  projectId,
  notes,
}: ClientBriefingComplementProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsPending(true)
    try {
      const result = await addBriefingNoteAction({
        projectId,
        title,
        content,
      })
      if (result.success) {
        toast.success("Nota estratégica adicionada.")
        setTitle("")
        setContent("")
      } else {
        toast.error(result.error || "Erro ao adicionar nota.")
      }
    } catch {
      toast.error("Erro inesperado.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="rounded-[1.75rem] border-border/20 bg-muted/5">
        <CardHeader className="p-5 pb-4 sm:p-6">
          <CardTitle className="font-heading text-xl font-black uppercase tracking-tight">
            Adicionar Complemento
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Envie informações adicionais para o time estratégico
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                Título do Complemento
              </label>
              <Input
                placeholder="Ex: Novos objetivos de conversão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-2xl border-border/40 bg-muted/20 px-5 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                Descrição Detalhada
              </label>
              <Textarea
                placeholder="Descreva aqui o que mudou ou o que precisa ser considerado..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-36 resize-none rounded-[1.5rem] border-border/40 bg-muted/20 p-5 text-sm leading-relaxed"
              />
            </div>
            <CardFooter className="p-0">
              <Button
                type="submit"
                disabled={isPending || !title.trim() || !content.trim()}
                className="h-12 w-full rounded-full bg-brand-primary text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
              >
                <Plus weight="bold" className="mr-2 size-4" />
                {isPending ? "Processando..." : "Enviar Complemento"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 px-1">
            <ClockCountdown
              weight="duotone"
              className="size-5 text-brand-primary/60"
            />
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-muted-foreground/60">
              Histórico de Complementos
            </h2>
          </div>

          <div className="grid gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="rounded-[1.5rem] border-border/15 bg-muted/5 p-5 transition-all hover:border-brand-primary/20 sm:p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground/85">
                      {note.title}
                    </h3>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/45">
                      {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground/75">
                    {note.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
