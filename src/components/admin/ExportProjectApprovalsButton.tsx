"use client"

import * as React from "react"

import { Printer } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { exportProjectApprovalsHtmlAction } from "@/src/lib/actions/project.actions"

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
  const [isPrinting, setIsPrinting] = React.useState(false)

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
  )
}
