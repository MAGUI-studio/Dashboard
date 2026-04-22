"use client"

import * as React from "react"

import { DownloadSimple, Printer } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import {
  exportProjectApprovalsCsvAction,
  exportProjectApprovalsHtmlAction,
} from "@/src/lib/actions/project.actions"

interface ExportProjectApprovalsButtonProps {
  projectId: string
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ExportProjectApprovalsButton({
  projectId,
}: ExportProjectApprovalsButtonProps): React.JSX.Element {
  const [isExporting, setIsExporting] = React.useState(false)
  const [isPrinting, setIsPrinting] = React.useState(false)

  async function handleCsvExport(): Promise<void> {
    setIsExporting(true)

    try {
      const result = await exportProjectApprovalsCsvAction(projectId)

      if (!result.success || !result.csv || !result.filename) {
        toast.error(result.error ?? "Não foi possível exportar aprovações.")
        return
      }

      downloadFile(result.csv, result.filename, "text/csv;charset=utf-8")
      toast.success("Histórico de aprovações exportado.")
    } catch {
      toast.error("Não foi possível exportar aprovações.")
    } finally {
      setIsExporting(false)
    }
  }

  async function handlePrintExport(): Promise<void> {
    setIsPrinting(true)

    try {
      const result = await exportProjectApprovalsHtmlAction(projectId)

      if (!result.success || !result.html || !result.filename) {
        toast.error(result.error ?? "Não foi possível gerar impressão.")
        return
      }

      downloadFile(result.html, result.filename, "text/html;charset=utf-8")
      toast.success("Versão print-friendly gerada.")
    } catch {
      toast.error("Não foi possível gerar impressão.")
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleCsvExport}
        disabled={isExporting}
        className="h-10 rounded-full px-5 text-[9px] font-black uppercase tracking-[0.18em]"
      >
        <DownloadSimple weight="duotone" className="mr-2 size-3.5" />
        {isExporting ? "Exportando" : "CSV"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handlePrintExport}
        disabled={isPrinting}
        className="h-10 rounded-full px-5 text-[9px] font-black uppercase tracking-[0.18em]"
      >
        <Printer weight="duotone" className="mr-2 size-3.5" />
        {isPrinting ? "Gerando" : "Imprimir"}
      </Button>
    </div>
  )
}
