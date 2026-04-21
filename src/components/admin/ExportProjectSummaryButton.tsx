"use client"

import * as React from "react"

import { DownloadSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { exportProjectSummaryHtmlAction } from "@/src/lib/actions/project.actions"

export function ExportProjectSummaryButton({
  projectId,
}: {
  projectId: string
}): React.JSX.Element {
  const [isExporting, setIsExporting] = React.useState(false)

  async function handleExport(): Promise<void> {
    setIsExporting(true)

    try {
      const result = await exportProjectSummaryHtmlAction(projectId)

      if (!result.success || !result.html || !result.filename) {
        toast.error(result.error ?? "Não foi possível exportar o resumo.")
        return
      }

      const blob = new Blob([result.html], {
        type: "text/html;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Resumo print-friendly exportado.")
    } catch {
      toast.error("Não foi possível exportar o resumo.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="h-11 rounded-full px-5 text-[9px] font-black uppercase tracking-[0.18em]"
    >
      <DownloadSimple weight="duotone" className="mr-2 size-4" />
      {isExporting ? "Exportando" : "Exportar resumo"}
    </Button>
  )
}
