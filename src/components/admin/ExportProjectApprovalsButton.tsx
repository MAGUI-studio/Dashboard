"use client"

import * as React from "react"

import { DownloadSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { exportProjectApprovalsCsvAction } from "@/src/lib/actions/project.actions"

interface ExportProjectApprovalsButtonProps {
  projectId: string
}

export function ExportProjectApprovalsButton({
  projectId,
}: ExportProjectApprovalsButtonProps): React.JSX.Element {
  const [isExporting, setIsExporting] = React.useState(false)

  async function handleExport(): Promise<void> {
    setIsExporting(true)

    try {
      const result = await exportProjectApprovalsCsvAction(projectId)

      if (!result.success || !result.csv || !result.filename) {
        toast.error(result.error ?? "Não foi possível exportar aprovações.")
        return
      }

      const blob = new Blob([result.csv], {
        type: "text/csv;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Histórico de aprovações exportado.")
    } catch {
      toast.error("Não foi possível exportar aprovações.")
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
      className="h-10 rounded-full px-5 text-[9px] font-black uppercase tracking-[0.18em]"
    >
      <DownloadSimple weight="duotone" className="mr-2 size-3.5" />
      {isExporting ? "Exportando" : "Exportar aprovações"}
    </Button>
  )
}
