"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Plus, NotePencil, ClockCountdown } from "@phosphor-icons/react"
import { addBriefingNoteAction } from "@/src/lib/actions/project.actions"
import { toast } from "sonner"
import { DashboardBriefingEntry } from "@/src/types/dashboard"

interface ClientBriefingComplementProps {
  projectId: string
  notes: DashboardBriefingEntry[]
}

export function ClientBriefingComplement({ projectId, notes }: ClientBriefingComplementProps) {
  const t = useTranslations("Briefing")
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
    } catch (error) {
      toast.error("Erro inesperado.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <Card className="rounded-[2.5rem] border-border/40 bg-muted/5 p-8">
        <CardHeader className="p-0 pb-8">
          <CardTitle className="font-heading text-xl font-black uppercase tracking-tight">
            Adicionar Complemento
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Envie informações adicionais para o time estratégico
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                Título do Complemento
              </label>
              <Input
                placeholder="Ex: Novos objetivos de conversão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-2xl border-border/40 bg-background/50 px-5 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                Descrição Detalhada
              </label>
              <Textarea
                placeholder="Descreva aqui o que mudou ou o que precisa ser considerado..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] rounded-[1.5rem] border-border/40 bg-background/50 p-5 text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || !title.trim() || !content.trim()}
              className="h-12 rounded-full bg-brand-primary text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
            >
              <Plus weight="bold" className="mr-2 size-4" />
              {isPending ? "Processando..." : "Enviar Complemento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <ClockCountdown weight="duotone" className="size-5 text-muted-foreground/40" />
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-muted-foreground/60">
              Histórico de Complementos
            </h2>
          </div>

          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="rounded-3xl border-border/20 bg-muted/5 p-8 transition-all hover:bg-muted/10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground/80">
                      {note.title}
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
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
