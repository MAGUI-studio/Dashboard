"use client"

import * as React from "react"

import {
  CircleNotch,
  DownloadSimple,
  FileCsv,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import { importLeadsAction } from "@/src/lib/actions/crm.actions"

export function CSVImportDialog(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)

  const downloadTemplate = () => {
    const headers =
      "companyName,contactName,email,phone,website,instagram,source\n"
    const example =
      "Exemplo Corp,Joao Silva,joao@exemplo.com,11999999999,https://exemplo.com,exemplo_insta,OTHER\n"
    const blob = new Blob([headers + example], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_leads_magui.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()

    reader.onload = async (event) => {
      const text = event.target?.result as string
      if (!text) {
        toast.error("Arquivo vazio ou invalido.")
        setIsImporting(false)
        return
      }

      const rows = text.split("\n").filter((row) => row.trim() !== "")
      const headers = rows[0].split(",").map((h) => h.trim())

      const leadsData = rows
        .slice(1)
        .map((row) => {
          const values = row.split(",").map((v) => v.trim())
          const lead: Record<string, string> = {}
          headers.forEach((header, index) => {
            if (values[index]) {
              lead[header] = values[index]
            }
          })
          return lead
        })
        .filter((l) => l.companyName)

      if (leadsData.length === 0) {
        toast.error("Nenhum lead valido encontrado no CSV.")
        setIsImporting(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await importLeadsAction(leadsData as any[])
      if (result.success) {
        toast.success(`${result.count} leads importados com sucesso!`)
        setOpen(false)
      } else {
        toast.error(result.error || "Erro na importacao.")
      }
      setIsImporting(false)
    }

    reader.onerror = () => {
      toast.error("Erro ao ler arquivo.")
      setIsImporting(false)
    }

    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-border/60 bg-background/80 px-4 text-[10px] font-black uppercase tracking-widest"
        >
          <FileCsv className="mr-2 size-4 text-green-600" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="bg-brand-primary/10 p-10 pb-6">
          <DialogHeader className="gap-5">
            <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
              <FileCsv weight="bold" className="size-8" />
            </div>
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight text-brand-primary leading-none">
                Importacao em Lote
              </DialogTitle>
              <DialogDescription className="text-xs font-black text-brand-primary/60 uppercase tracking-[0.2em]">
                Cadastro rapido via CSV
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="p-10 pt-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl bg-muted/10 p-5 border border-border/40">
              <WarningCircle
                weight="fill"
                className="size-5 text-amber-500 mt-0.5"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-tight text-foreground/80">
                  Instrucoes de Formato
                </p>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  Use virgula (,) como separador. O campo <b>companyName</b> e
                  obrigatorio. Origens validas: REFERRAL, ORGANIC, INSTAGRAM,
                  LINKEDIN, WEBSITE, OTHER.
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={downloadTemplate}
              className="h-10 w-full rounded-xl border border-dashed border-border/60 text-[10px] font-black uppercase tracking-widest"
            >
              <DownloadSimple className="mr-2 size-4" />
              Baixar Template CSV
            </Button>
          </div>

          <div className="relative group">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
            <div className="flex flex-col items-center justify-center gap-4 h-40 rounded-[1.8rem] border-2 border-dashed border-brand-primary/20 bg-brand-primary/[0.02] transition-all group-hover:border-brand-primary/40 group-hover:bg-brand-primary/[0.04]">
              {isImporting ? (
                <CircleNotch className="size-8 text-brand-primary animate-spin" />
              ) : (
                <UploadSimple className="size-8 text-brand-primary/40" />
              )}
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-tight text-foreground/80">
                  {isImporting ? "Processando..." : "Clique ou arraste seu CSV"}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground/40 mt-1">
                  Apenas arquivos .csv sao suportados
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full h-12 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
