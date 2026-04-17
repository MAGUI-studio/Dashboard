"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadStatus } from "@/src/generated/client/enums"
import { Lead } from "@/src/types/crm"
import {
  Building,
  CalendarDots,
  CaretDown,
  CaretUp,
  CaretUpDown,
  CheckCircle,
  ClockCountdown,
  DotsThreeVertical,
  Envelope,
  Globe,
  Handshake,
  InstagramLogo,
  MagnifyingGlass,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Input } from "@/src/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { deleteLead, updateLeadStatus } from "@/src/lib/actions/crm.actions"

interface LeadsTableProps {
  leads: Lead[]
}

type SortConfig = {
  key: "company" | "contact" | "status" | "value"
  direction: "asc" | "desc" | null
}

export function LeadsTable({ leads }: LeadsTableProps): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortConfig>({
    key: "company",
    direction: null,
  })

  const handleStatusUpdate = async (
    id: string,
    status: LeadStatus
  ): Promise<void> => {
    const result = await updateLeadStatus(id, status)
    if (result.success) {
      toast.success(t("form.success"))
    } else {
      toast.error(t("form.error"))
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Confirm delete?")) return
    const result = await deleteLead(id)
    if (result.success) {
      toast.success(t("form.success"))
    } else {
      toast.error(t("form.error"))
    }
  }

  const handleSort = (key: SortConfig["key"]): void => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key, direction: null }
        return { key, direction: "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const getSortIcon = (key: SortConfig["key"]): React.JSX.Element => {
    if (sort.key !== key || !sort.direction)
      return <CaretUpDown className="size-3 opacity-30" />
    return sort.direction === "asc" ? (
      <CaretUp className="size-3 text-brand-primary" />
    ) : (
      <CaretDown className="size-3 text-brand-primary" />
    )
  }

  const filteredAndSortedLeads = React.useMemo(() => {
    let result = [...leads]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (lead: Lead) =>
          lead.companyName.toLowerCase().includes(query) ||
          (lead.contactName?.toLowerCase() || "").includes(query) ||
          (lead.email?.toLowerCase() || "").includes(query)
      )
    }

    if (sort.direction) {
      result.sort((a: Lead, b: Lead) => {
        let valA = ""
        let valB = ""

        if (sort.key === "company") {
          valA = a.companyName.toLowerCase()
          valB = b.companyName.toLowerCase()
        } else if (sort.key === "contact") {
          valA = (a.contactName || "").toLowerCase()
          valB = (b.contactName || "").toLowerCase()
        } else if (sort.key === "status") {
          valA = a.status.toLowerCase()
          valB = b.status.toLowerCase()
        } else if (sort.key === "value") {
          valA = (a.value || "").toLowerCase()
          valB = (b.value || "").toLowerCase()
        }

        if (valA < valB) return sort.direction === "asc" ? -1 : 1
        if (valA > valB) return sort.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [leads, search, sort])

  const getNextActionMeta = (
    dateValue: string | Date | null
  ): { label: string; tone: string } => {
    if (!dateValue) {
      return {
        label: "Sem proxima acao",
        tone: "text-muted-foreground/50",
      }
    }

    const target = new Date(dateValue)
    const today = new Date()
    const targetDay = new Date(target)
    const todayDay = new Date(today)
    targetDay.setHours(0, 0, 0, 0)
    todayDay.setHours(0, 0, 0, 0)

    const diffInDays = Math.ceil(
      (targetDay.getTime() - todayDay.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffInDays < 0) {
      return {
        label: `Atrasado ha ${Math.abs(diffInDays)} dia(s)`,
        tone: "text-red-500",
      }
    }

    if (diffInDays === 0) {
      return {
        label: "Acao prevista para hoje",
        tone: "text-amber-500",
      }
    }

    if (diffInDays <= 3) {
      return {
        label: `Proximo toque em ${diffInDays} dia(s)`,
        tone: "text-brand-primary",
      }
    }

    return {
      label: `Agendado para ${target.toLocaleDateString()}`,
      tone: "text-muted-foreground/70",
    }
  }

  const getStatusBadge = (status: LeadStatus): React.JSX.Element => {
    const variants: Record<LeadStatus, string> = {
      GARIMPAGEM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      CONTATO_REALIZADO:
        "bg-purple-500/10 text-purple-500 border-purple-500/20",
      NEGOCIACAO: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      CONVERTIDO: "bg-green-500/10 text-green-500 border-green-500/20",
      DESCARTADO: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return (
      <Badge
        variant="outline"
        className={`rounded-full px-3 py-1 font-medium ${variants[status]}`}
      >
        {t(`status.${status}`)}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative group max-w-md">
        <MagnifyingGlass
          weight="duotone"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por empresa, contato ou e-mail..."
          className="h-14 rounded-2xl border-border/40 bg-muted/20 pl-12 pr-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/30"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-background/50 backdrop-blur-md shadow-2xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/60">
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group/header"
                onClick={() => handleSort("company")}
              >
                <div className="flex items-center gap-2">
                  {t("table.company")}
                  {getSortIcon("company")}
                </div>
              </TableHead>
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group/header"
                onClick={() => handleSort("contact")}
              >
                <div className="flex items-center gap-2">
                  {t("table.contact")}
                  {getSortIcon("contact")}
                </div>
              </TableHead>
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group/header"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  {t("table.status")}
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group/header"
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center gap-2">
                  {t("table.value")}
                  {getSortIcon("value")}
                </div>
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Cadência
              </TableHead>
              <TableHead className="px-8 h-16 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
                >
                  {t("table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="group border-border/20 transition-all hover:bg-brand-primary/[0.03]"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-transform group-hover:scale-110">
                        <Building size={20} weight="bold" />
                      </div>
                      <div>
                        <div className="font-bold tracking-tight text-foreground">
                          {lead.companyName}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-brand-primary transition-colors"
                            >
                              <Globe size={14} />
                            </a>
                          )}
                          {lead.instagram && (
                            <span className="text-muted-foreground">
                              <InstagramLogo size={14} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {lead.contactName || "---"}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                        {lead.email || "---"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="font-mono text-sm font-semibold text-brand-primary">
                      {lead.value || "---"}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        {lead.source}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/70">
                        <CalendarDots size={12} />
                        {lead.nextActionAt
                          ? new Date(lead.nextActionAt).toLocaleDateString()
                          : "Sem próxima ação"}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] ${getNextActionMeta(lead.nextActionAt).tone}`}
                      >
                        <ClockCountdown size={12} />
                        {getNextActionMeta(lead.nextActionAt).label}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
                        >
                          <DotsThreeVertical size={24} weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 border-border/60 bg-background/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl"
                      >
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {t("table.actions")}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/40" />

                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(lead.id, "CONTATO_REALIZADO")
                          }
                          className="rounded-xl flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-brand-primary/5"
                        >
                          <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Envelope
                              className="text-purple-500"
                              size={18}
                              weight="bold"
                            />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-tight">
                            {t("status.CONTATO_REALIZADO")}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(lead.id, "NEGOCIACAO")
                          }
                          className="rounded-xl flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-brand-primary/5"
                        >
                          <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Handshake
                              className="text-orange-500"
                              size={18}
                              weight="bold"
                            />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-tight">
                            {t("status.NEGOCIACAO")}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(lead.id, "CONVERTIDO")
                          }
                          className="rounded-xl flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-green-500/5 group/convert"
                        >
                          <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover/convert:bg-green-500 transition-colors">
                            <CheckCircle
                              className="text-green-500 group-hover/convert:text-white"
                              size={18}
                              weight="bold"
                            />
                          </div>
                          <span className="text-sm font-black uppercase tracking-tight text-green-500">
                            {t("status.CONVERTIDO")}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border/40" />

                        <DropdownMenuItem
                          onClick={() => handleDelete(lead.id)}
                          className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                        >
                          <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Trash size={18} weight="bold" />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-tight">
                            Remover Lead
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/20 bg-muted/20 px-8 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Total de {filteredAndSortedLeads.length} leads encontrados
          </p>
        </div>
      </Card>
    </div>
  )
}
