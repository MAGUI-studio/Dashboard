"use client"

import * as React from "react"

import { ProposalStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  DotsThreeVertical,
  FilePdf,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import {
  deleteProposalAction,
  updateProposalStatusAction,
} from "@/src/lib/actions/proposal.actions"

interface ProposalRecord {
  id: string
  number: number
  title: string
  status: ProposalStatus
  validUntil: Date | string | null
  totalValue: number
  currency: string
  createdAt: Date | string
  lead: {
    id: string
    companyName: string
  }
}

interface ProposalsOverviewListProps {
  proposals: ProposalRecord[]
}

export function ProposalsOverviewList({
  proposals,
}: ProposalsOverviewListProps): React.JSX.Element {
  const [items, setItems] = React.useState(proposals)

  const handleDelete = async (id: string) => {
    const result = await deleteProposalAction(id)
    if (result.success) {
      toast.success("Proposta excluida")
      setItems((current) => current.filter((proposal) => proposal.id !== id))
    } else {
      toast.error("Erro ao excluir proposta")
    }
  }

  const handleStatusChange = async (id: string, status: ProposalStatus) => {
    const result = await updateProposalStatusAction(id, status)
    if (result.success) {
      toast.success("Status atualizado")
      setItems((current) =>
        current.map((proposal) =>
          proposal.id === id ? { ...proposal, status } : proposal
        )
      )
    } else {
      toast.error("Erro ao atualizar status")
    }
  }

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[8px] font-black uppercase text-emerald-600">
            Aceita
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="border-red-500/20 bg-red-500/10 text-[8px] font-black uppercase text-red-600">
            Recusada
          </Badge>
        )
      case "SENT":
        return (
          <Badge className="border-blue-500/20 bg-blue-500/10 text-[8px] font-black uppercase text-blue-600">
            Enviada
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge className="border-border/50 bg-muted text-[8px] font-black uppercase text-muted-foreground">
            Expirada
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[8px] font-black uppercase">
            Rascunho
          </Badge>
        )
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border/20 bg-muted/5 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted/10 text-muted-foreground/30">
          <FilePdf size={24} weight="duotone" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
          Nenhuma proposta gerada ainda
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {items.map((proposal) => (
        <div
          key={proposal.id}
          className="group relative flex flex-col gap-5 rounded-3xl border border-border/40 bg-background/50 p-6 transition-all hover:border-brand-primary/30 hover:bg-muted/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <FilePdf weight="duotone" className="size-6" />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="truncate text-sm font-black uppercase tracking-tight text-foreground">
                  {proposal.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground/50">
                    #{proposal.number}
                  </span>
                  {getStatusBadge(proposal.status)}
                </div>
                <Link
                  href={{
                    pathname: "/admin/crm/leads/[id]/proposals",
                    params: { id: proposal.lead.id },
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45 transition-colors hover:text-brand-primary"
                >
                  {proposal.lead.companyName}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-border/40 bg-background/50 px-4 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
              >
                <a
                  href={`/api/proposals/${proposal.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir PDF <ArrowSquareOut className="ml-1.5 size-3.5" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-border/40 bg-background/50 px-4 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
              >
                <a
                  href={`/api/proposals/${proposal.id}/pdf?download=1`}
                  download={`proposta-${proposal.number}.pdf`}
                >
                  Baixar PDF
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-border/40 bg-background/50 px-4 text-[9px] font-black uppercase tracking-widest"
              >
                <Link
                  href={{
                    pathname: "/admin/crm/proposals/new",
                    query: { leadId: proposal.lead.id },
                  }}
                >
                  Duplicar base
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                  >
                    <DotsThreeVertical weight="bold" className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-2xl border-border/40 bg-background/95 p-1.5 backdrop-blur-xl shadow-2xl"
                >
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(proposal.id, "SENT")}
                    className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-blue-500/10 focus:text-blue-600"
                  >
                    Marcar como Enviada
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(proposal.id, "ACCEPTED")}
                    className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-emerald-500/10 focus:text-emerald-600"
                  >
                    Marcar como Aceita
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(proposal.id, "REJECTED")}
                    className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-red-500/10 focus:text-red-600"
                  >
                    Marcar como Recusada
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(proposal.id)}
                    className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    Excluir Proposta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/10 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                  Investimento
                </span>
                <span className="text-sm font-black text-foreground/80">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: proposal.currency,
                  }).format(proposal.totalValue)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                  Validade
                </span>
                <span className="text-[10px] font-bold text-muted-foreground/60">
                  {proposal.validUntil
                    ? new Date(proposal.validUntil).toLocaleDateString("pt-BR")
                    : "Indeterminado"}
                </span>
              </div>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/30 italic">
              Criada em{" "}
              {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
