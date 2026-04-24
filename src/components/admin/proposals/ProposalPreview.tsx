"use client"

import * as React from "react"

import {
  ArrowLeft,
  Buildings,
  Calendar,
  CheckCircle,
  CurrencyDollar,
  FilePdf,
  Info,
  ListChecks,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

interface ProposalPreviewProps {
  data: {
    title: string
    leadName: string
    executiveSummary: string
    objectives: string
    expectedImpact: string
    differentials: string
    timeline: string
    paymentTerms: string
    platformFlow: string
    nextSteps: string
    notes: string
    items: Array<{
      description: string
      longDescription: string
      unitValue: number
      quantity: number
    }>
    total: number
    validUntil: string
    currency: string
  }
  onBack: () => void
  onConfirm: () => void
  isSubmitting: boolean
}

export function ProposalPreview({
  data,
  onBack,
  onConfirm,
  isSubmitting,
}: ProposalPreviewProps): React.JSX.Element {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: data.currency || "BRL",
    }).format(value)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 sticky top-4 z-10 bg-background/80 backdrop-blur-md p-4 rounded-3xl border border-border/10 shadow-2xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="mr-2" weight="bold" /> Voltar para Edição
        </Button>
        <div className="flex items-center gap-3">
          <p className="hidden sm:block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mr-4">
            Revise os dados antes de gerar o PDF oficial
          </p>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-full bg-brand-primary px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105"
          >
            {isSubmitting ? "Gerando..." : "Confirmar e Gerar PDF"}
            {!isSubmitting && (
              <FilePdf className="ml-2" weight="bold" size={16} />
            )}
          </Button>
        </div>
      </div>

      {/* PDF Mockup Container */}
      <div className="overflow-hidden rounded-[2.5rem] border border-border/20 bg-white shadow-2xl text-[#0F172A] font-sans">
        {/* Page 1: Brand & Lead */}
        <div className="p-16 sm:p-24 border-b border-border/10 min-h-[600px] flex flex-col justify-between">
          <div className="flex justify-end items-start">
            <div className="text-right">
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#0093C8]">
                Padrão de Autoridade Digital
              </p>
              <p className="text-[9px] font-bold text-muted-foreground/60">
                magui.studio | contato@magui.studio
              </p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Emitido em {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-1 w-20 bg-[#0093C8] rounded-full" />
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0093C8]">
                Proposta Comercial
              </p>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
                {data.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-8 pt-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  Apresentado para
                </p>
                <div className="flex items-center gap-2">
                  <Buildings
                    size={16}
                    className="text-[#0093C8]"
                    weight="bold"
                  />
                  <p className="text-lg font-black uppercase tracking-tight">
                    {data.leadName}
                  </p>
                </div>
              </div>
              {data.validUntil && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Validade
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={16}
                      className="text-[#0093C8]"
                      weight="bold"
                    />
                    <p className="text-lg font-black uppercase tracking-tight">
                      {new Date(data.validUntil).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Narrative */}
        <div className="p-16 sm:p-24 bg-slate-50/50 space-y-16">
          {data.executiveSummary && (
            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0093C8] flex items-center gap-3">
                <div className="h-px w-8 bg-[#0093C8]/30" /> Resumo Executivo
              </h3>
              <p className="text-lg font-medium leading-relaxed max-w-3xl text-slate-700 italic">
                &quot;{data.executiveSummary}&quot;
              </p>
            </div>
          )}

          <div className="grid gap-16 md:grid-cols-2">
            {data.objectives && (
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0093C8]">
                  Objetivos do Projeto
                </h3>
                <div className="space-y-4">
                  {data.objectives
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <div key={i} className="flex gap-3">
                        <CheckCircle
                          size={18}
                          weight="fill"
                          className="text-[#0093C8] shrink-0"
                        />
                        <p className="text-sm font-semibold text-slate-600">
                          {line}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {data.expectedImpact && (
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0093C8]">
                  Impacto Esperado
                </h3>
                <div className="space-y-4">
                  {data.expectedImpact
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <div key={i} className="flex gap-3">
                        <CheckCircle
                          size={18}
                          weight="fill"
                          className="text-[#0093C8] shrink-0"
                        />
                        <p className="text-sm font-semibold text-slate-600">
                          {line}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Deliverables */}
        <div className="p-16 sm:p-24 space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Escopo da Entrega
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-8">
            {data.items.map((item, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-slate-100 p-8 transition-colors hover:bg-slate-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0093C8]">
                      Entrega {String(i + 1).padStart(2, "0")}
                    </p>
                    <h4 className="text-xl font-black uppercase">
                      {item.description}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase mb-1">
                      Subtotal
                    </p>
                    <p className="text-lg font-black">
                      {formatCurrency(item.unitValue * item.quantity)}
                    </p>
                  </div>
                </div>
                {item.longDescription && (
                  <p className="whitespace-pre-wrap border-t border-slate-100 mt-4 pt-4 text-sm font-medium leading-relaxed text-slate-500">
                    {item.longDescription}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section: Governance */}
        <div className="border-t border-slate-100 p-16 sm:p-24 space-y-8">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0093C8]">
              <Info weight="bold" /> Operação e Governança
            </h4>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
              {data.platformFlow}
            </p>
          </div>
        </div>

        {/* Section: Investment */}
        <div className="bg-[#0F172A] p-16 text-white sm:p-24">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0093C8]">
                  Investimento Consolidado
                </p>
                <h2 className="text-6xl font-black tracking-tighter tabular-nums sm:text-8xl">
                  {formatCurrency(data.total)}
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                Valor total para execução integral do escopo apresentado,
                incluindo coordenação, design, desenvolvimento e governança
                MAGUI.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 space-y-8">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0093C8]">
                  <CurrencyDollar weight="bold" /> Condições de Pagamento
                </h4>
                <p className="text-sm font-bold leading-relaxed">
                  {data.paymentTerms || "A combinar no kickoff."}
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0093C8]">
                  <ListChecks weight="bold" /> Prazo Estimado
                </h4>
                <p className="text-sm font-bold leading-relaxed">
                  {data.timeline || "Início imediato após aprovação."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Next Steps & Footer */}
        <div className="border-t border-slate-100 p-16 sm:p-24 space-y-16">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ArrowLeft className="rotate-180" weight="bold" /> Próximos Passos
            </h4>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              {data.nextSteps || "Aprovação e kickoff inicial."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-16 sm:flex-row">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                MAGUI.studio
              </p>
              <p className="text-[8px] font-bold uppercase tracking-tight text-slate-400">
                magui.studio | contato@magui.studio
              </p>
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">
              Padrão de Autoridade Digital © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
