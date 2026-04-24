"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import {
  CaretLeft,
  DownloadSimple,
  PaperPlaneTilt,
  Pencil,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"

import {
  deleteDocumentAction,
  sendDocumentToSignatureAction,
} from "@/src/lib/actions/document.actions"
import { cn } from "@/src/lib/utils/utils"

interface DocumentDetailsHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: any
}

export function DocumentDetailsHeader({
  document,
}: DocumentDetailsHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)

  const handleSendToSignature = async () => {
    setIsSending(true)
    try {
      const result = await sendDocumentToSignatureAction(document.id)
      if (result.success) {
        toast.success("Documento enviado para assinatura!")
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsSending(false)
    }
  }

  const statusColors = {
    DRAFT: "bg-muted/50 text-muted-foreground border-border/40",
    SENT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    VIEWED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    SIGNED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    COMPLETED: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
    EXPIRED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteDocumentAction(document.id)
      if (result.success) {
        toast.success("Documento excluído.")
        router.push("/admin/documents")
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <header className="flex flex-col gap-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="group w-fit -ml-2 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 transition-all hover:text-foreground"
      >
        <CaretLeft
          weight="bold"
          className="mr-2 size-3 transition-transform group-hover:-translate-x-1"
        />
        Voltar para listagem
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="rounded-full border-brand-primary/20 bg-brand-primary/10 px-4 py-1 text-[9px] font-black uppercase tracking-widest text-brand-primary"
            >
              {document.type}
            </Badge>
            <Badge
              className={cn(
                "rounded-full border px-4 py-1 text-[9px] font-black uppercase tracking-widest shadow-none",
                statusColors[document.status as keyof typeof statusColors]
              )}
            >
              {document.status}
            </Badge>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight lg:text-6xl">
            {document.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            asChild
            className="h-12 rounded-full border-border/40 px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5"
          >
            <a
              href={`/api/documents/${document.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DownloadSimple weight="bold" className="mr-2 size-4" /> Exportar
              PDF
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-12 rounded-full border-border/40 px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5"
          >
            <Pencil weight="bold" className="mr-2 size-4" /> Editar Dados
          </Button>

          {document.status === "DRAFT" && (
            <Button
              onClick={handleSendToSignature}
              disabled={isSending}
              className="h-12 rounded-full bg-brand-primary px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSending ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <PaperPlaneTilt weight="fill" className="mr-2 size-4" />{" "}
                  Enviar para Assinatura
                </>
              )}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                className="size-12 rounded-full border border-transparent text-destructive/40 hover:border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
              >
                {isDeleting ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-destructive/20 border-t-destructive" />
                ) : (
                  <Trash weight="bold" className="size-5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-border/10 bg-background/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                  Excluir Documento
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                  Esta ação é permanente e removerá este documento e todo o seu
                  histórico de assinaturas do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8">
                <AlertDialogCancel className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest border-border/40">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-full bg-destructive px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-destructive/20 transition-all hover:bg-destructive/90"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  )
}
