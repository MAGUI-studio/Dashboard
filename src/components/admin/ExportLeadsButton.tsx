"use client"

import * as React from "react"

import { DownloadSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { exportLeadsCsvAction } from "@/src/lib/actions/crm.actions"

export function ExportLeadsButton(): React.JSX.Element {
  const [isExporting, setIsExporting] = React.useState(false)

  async function handleExport(): Promise<void> {
    setIsExporting(true)

    try {
      const result = await exportLeadsCsvAction()

      if (!result.success || !result.csv || !result.filename) {
        toast.error(result.error ?? "Não foi possível exportar os leads.")
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

      toast.success("Leads exportados em CSV.")
    } catch {
      toast.error("Não foi possível exportar os leads.")
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
      className="h-14 rounded-full px-7 font-sans text-[10px] font-black uppercase tracking-[0.18em]"
    >
      <DownloadSimple weight="duotone" className="mr-2 size-4" />
      {isExporting ? "Exportando" : "Exportar CSV"}
    </Button>
  )
}
