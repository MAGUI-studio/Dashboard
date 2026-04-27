"use client"

import * as React from "react"

import { useRouter } from "@/src/i18n/navigation"
import {
  Calculator,
  ClockCountdown,
  FilePdf,
  ListChecks,
  MagicWand,
  Plus,
  Sparkle,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"

import { createProposalAction } from "@/src/lib/actions/proposal.actions"

import {
  PROPOSAL_PRESETS,
  type ProposalPreset,
} from "@/src/config/proposal-presets"

import { ProposalPreview } from "./ProposalPreview"

interface ProposalBuilderFormProps {
  leads: Array<{ id: string; companyName: string }>
  initialLeadId?: string
}

interface ProposalItemForm {
  description: string
  longDescription: string
  unitValue: number
  quantity: number
}

const EMPTY_ITEM: ProposalItemForm = {
  description: "",
  longDescription: "",
  unitValue: 0,
  quantity: 1,
}

const DEFAULT_PLATFORM_FLOW =
  "Toda a comunicação, aprovações, centralização de arquivos e acompanhamento das etapas acontecem pela plataforma da MAGUI. Isso reduz ruído operacional, evita retrabalho e concentra histórico, decisões e materiais em um único ambiente."

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "")
  return digits ? Number(digits) / 100 : 0
}

function formatCurrencyInput(value: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value)
}

export function ProposalBuilderForm({
  leads,
  initialLeadId,
}: ProposalBuilderFormProps): React.JSX.Element {
  const router = useRouter()
  const initialLead =
    leads.find((lead) => lead.id === initialLeadId) ?? leads[0] ?? null
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedLeadId, setSelectedLeadId] = React.useState(
    initialLead?.id ?? ""
  )
  const [title, setTitle] = React.useState(
    initialLead
      ? `Proposta Comercial - ${initialLead.companyName}`
      : "Proposta Comercial"
  )
  const [validUntil, setValidUntil] = React.useState("")
  const [executiveSummary, setExecutiveSummary] = React.useState("")
  const [objectives, setObjectives] = React.useState("")
  const [expectedImpact, setExpectedImpact] = React.useState("")
  const [differentials, setDifferentials] = React.useState("")
  const [timeline, setTimeline] = React.useState("")
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [platformFlow, setPlatformFlow] = React.useState(DEFAULT_PLATFORM_FLOW)
  const [currency, setCurrency] = React.useState("BRL")
  const [nextSteps, setNextSteps] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [items, setItems] = React.useState<ProposalItemForm[]>([
    { ...EMPTY_ITEM },
  ])
  const [showPreview, setShowPreview] = React.useState(false)

  React.useEffect(() => {
    const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
    if (!selectedLead) return

    setTitle((currentTitle) => {
      if (
        currentTitle === "Proposta Comercial" ||
        currentTitle.startsWith("Proposta Comercial - ")
      ) {
        return `Proposta Comercial - ${selectedLead.companyName}`
      }

      return currentTitle
    })
  }, [selectedLeadId, leads])

  const total = items.reduce(
    (acc, item) => acc + item.unitValue * item.quantity,
    0
  )

  const handleAddItem = () =>
    setItems((current) => [...current, { ...EMPTY_ITEM }])

  const handleRemoveItem = (index: number) =>
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))

  const handleItemChange = (
    index: number,
    field: keyof ProposalItemForm,
    value: string | number
  ) => {
    setItems((current) => {
      const next = [...current]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleApplyPreset = (
    setter: (value: string | ((prev: string) => string)) => void,
    content: string
  ) => {
    const selectedLead = leads.find((l) => l.id === selectedLeadId)
    const processedContent = content.replace(
      "[Empresa]",
      selectedLead?.companyName ?? "empresa"
    )

    setter((prev) => {
      if (!prev.trim()) return processedContent
      return `${prev}\n\n${processedContent}`
    })
  }

  const buildProposalNotes = () => {
    const sections = [
      ["Resumo executivo", executiveSummary],
      ["Objetivos do projeto", objectives],
      ["Impacto esperado", expectedImpact],
      ["Diferenciais da entrega", differentials],
      ["Prazo estimado", timeline],
      ["Condições de pagamento", paymentTerms],
      ["Operação pela plataforma", platformFlow],
      ["Próximos passos", nextSteps],
      ["Observações adicionais", notes],
    ]
      .map(([sectionTitle, content]) => [sectionTitle, content.trim()] as const)
      .filter(([, content]) => content.length > 0)
      .map(([sectionTitle, content]) => `## ${sectionTitle}\n${content}`)

    return sections.join("\n\n")
  }

  const handleSubmit = async () => {
    if (!selectedLeadId) {
      toast.error("Selecione o lead para vincular a proposta")
      return
    }

    if (items.some((item) => !item.description.trim() || item.unitValue <= 0)) {
      toast.error("Preencha nome e valor de todos os itens da proposta")
      return
    }

    setIsSubmitting(true)

    const result = await createProposalAction({
      leadId: selectedLeadId,
      title,
      currency: currency,
      validUntil: validUntil || undefined,
      notes: buildProposalNotes() || undefined,
      items: items.map((item, order) => ({
        ...item,
        description: item.description.trim(),
        longDescription: item.longDescription.trim() || undefined,
        order,
      })),
    })

    if (result.success) {
      toast.success("Proposta criada com sucesso!")
      router.push("/admin/crm/proposals")
      return
    }

    toast.error("Erro ao criar proposta")
    setIsSubmitting(false)
  }

  if (showPreview) {
    const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
    return (
      <ProposalPreview
        isSubmitting={isSubmitting}
        onBack={() => setShowPreview(false)}
        onConfirm={handleSubmit}
        data={{
          title,
          leadName: selectedLead?.companyName ?? "Cliente",
          executiveSummary,
          objectives,
          expectedImpact,
          differentials,
          timeline,
          paymentTerms,
          platformFlow,
          nextSteps,
          notes,
          items: items.map((item) => ({
            ...item,
            longDescription: item.longDescription.trim(),
          })),
          total,
          validUntil,
          currency,
        }}
      />
    )
  }

  return (
    <div className="space-y-10">
      <section className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted/10 text-brand-primary">
            <FilePdf weight="bold" className="size-7" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary/65">
              Proposta Comercial
            </p>
            <h2 className="font-heading text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
              Estruture a proposta com clareza comercial
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/75">
              Preencha o contexto, as entregas e os acordos do projeto em uma
              leitura mais limpa. O PDF final vai puxar essas informações para
              gerar uma proposta mais legível, explicativa e orientada a valor.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Lead / cliente
            </Label>
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger
                size="lg"
                className="h-14 w-full rounded-2xl border-border/40 bg-muted/10 px-5 text-left font-sans font-bold text-foreground transition-all focus:ring-brand-primary/20 data-[placeholder]:text-muted-foreground"
              >
                <SelectValue placeholder="Selecione o lead da proposta" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="min-w-(--radix-select-trigger-width)"
              >
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Título do documento
            </Label>
            <div className="flex gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-14 flex-1 rounded-2xl border-border/40 bg-muted/10 px-5 text-sm font-semibold transition-all focus:border-brand-primary/50 focus:bg-muted/20"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-14 w-28 rounded-2xl border-border/40 bg-muted/10 px-4 font-mono font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  <SelectItem value="BRL" className="font-mono">
                    BRL
                  </SelectItem>
                  <SelectItem value="USD" className="font-mono">
                    USD
                  </SelectItem>
                  <SelectItem value="EUR" className="font-mono">
                    EUR
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 md:max-w-sm">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Validade da proposta
            </Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="h-14 rounded-2xl border-border/40 bg-muted/10 px-5 text-sm font-semibold transition-all focus:border-brand-primary/50 focus:bg-muted/20"
            />
          </div>
        </div>
      </section>

      <SectionHeading
        icon={Sparkle}
        title="Narrativa da proposta"
        description="Preencha o contexto, os objetivos e os argumentos que reforçam por que esse investimento faz sentido."
      />

      <section className="space-y-8">
        <FieldBlock
          label="Resumo executivo"
          value={executiveSummary}
          onChange={setExecutiveSummary}
          placeholder="Apresente a leitura do momento, a oportunidade e a transformação que esta proposta pretende viabilizar."
          minHeightClassName="min-h-40"
          presets={PROPOSAL_PRESETS.executiveSummary}
          onApplyPreset={(content) =>
            handleApplyPreset(setExecutiveSummary, content)
          }
        />
        <FieldBlock
          label="Objetivos do projeto"
          value={objectives}
          onChange={setObjectives}
          placeholder="Ex: estruturar a presença digital, elevar percepção de valor e melhorar a conversa comercial."
          presets={PROPOSAL_PRESETS.objectives}
          onApplyPreset={(content) => handleApplyPreset(setObjectives, content)}
        />
        <FieldBlock
          label="Impacto esperado"
          value={expectedImpact}
          onChange={setExpectedImpact}
          placeholder="Ex: mais clareza na oferta, melhor apresentação da marca e mais confiança no processo comercial."
          presets={PROPOSAL_PRESETS.expectedImpact}
          onApplyPreset={(content) =>
            handleApplyPreset(setExpectedImpact, content)
          }
        />
      </section>

      <section className="space-y-8">
        <FieldBlock
          label="Diferenciais da entrega"
          value={differentials}
          onChange={setDifferentials}
          placeholder="Ex: condução centralizada, linguagem premium, aprovações organizadas e leitura mais profissional do projeto."
          presets={PROPOSAL_PRESETS.differentials}
          onApplyPreset={(content) =>
            handleApplyPreset(setDifferentials, content)
          }
        />
        <FieldBlock
          label="Prazo estimado"
          value={timeline}
          onChange={setTimeline}
          placeholder="Ex: 20 dias úteis a partir da aprovação, kickoff e recebimento dos materiais."
          presets={PROPOSAL_PRESETS.timeline}
          onApplyPreset={(content) => handleApplyPreset(setTimeline, content)}
        />
        <FieldBlock
          label="Condições de pagamento"
          value={paymentTerms}
          onChange={setPaymentTerms}
          placeholder="Ex: 50% na aprovação e 50% na etapa final, via PIX ou transferência."
          presets={PROPOSAL_PRESETS.paymentTerms}
          onApplyPreset={(content) =>
            handleApplyPreset(setPaymentTerms, content)
          }
        />
      </section>

      <SectionHeading
        icon={ListChecks}
        title="Escopo e investimento"
        description="Organize as entregas com explicação comercial e mantenha o investimento total sempre visível."
      />

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Itens e serviços
              </Label>
              <p className="text-xs text-muted-foreground/50">
                Cada entrega deve deixar claro o que está incluso e qual papel
                ela cumpre dentro do projeto.
              </p>
            </div>
            <Button
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="h-10 rounded-full border-border/40 px-4 text-[9px] font-black uppercase tracking-widest"
            >
              <Plus className="mr-1.5 size-3" weight="bold" />
              Adicionar Item
            </Button>
          </div>

          <div className="grid gap-8">
            {items.map((item, index) => (
              <div
                key={index}
                className="border-t border-border/20 pt-8 first:border-t-0 first:pt-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/45">
                    Entrega {String(index + 1).padStart(2, "0")}
                  </p>
                  {items.length > 1 ? (
                    <Button
                      onClick={() => handleRemoveItem(index)}
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full text-muted-foreground/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash size={18} />
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                  <div className="space-y-2 md:col-span-6">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Nome da entrega
                    </Label>
                    <div className="space-y-2">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Ex: Landing page comercial"
                        className="h-12 rounded-xl border-border/40 bg-muted/10 px-4 text-sm font-medium shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {PROPOSAL_PRESETS.itemDescriptions.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() =>
                              handleItemChange(
                                index,
                                "description",
                                preset.content
                              )
                            }
                            className="rounded-full bg-muted/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-muted-foreground/60 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-4">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Valor unitário
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatCurrencyInput(item.unitValue, currency)}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitValue",
                            parseCurrencyInput(e.target.value)
                          )
                        }
                        className="h-12 rounded-xl border-border/40 bg-muted/10 px-4 text-sm font-mono font-bold shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Qtd
                    </Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      className="h-12 rounded-xl border-border/40 bg-muted/10 px-3 text-center text-sm font-bold shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-12">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Explicação comercial da entrega
                    </Label>
                    <div className="space-y-3">
                      <Textarea
                        value={item.longDescription}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "longDescription",
                            e.target.value
                          )
                        }
                        placeholder="Descreva o que entra nesta entrega, como ela será conduzida e qual valor ela gera para o projeto."
                        className="min-h-28 rounded-2xl border-border/40 bg-muted/10 px-4 py-3 text-sm font-medium shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                      />
                      <div className="flex flex-wrap gap-2">
                        {PROPOSAL_PRESETS.itemLongDescriptions.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              const currentVal = item.longDescription
                              const newVal = !currentVal.trim()
                                ? preset.content
                                : `${currentVal}\n\n${preset.content}`
                              handleItemChange(index, "longDescription", newVal)
                            }}
                            className="flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/70 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
                          >
                            <MagicWand size={10} weight="bold" />
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary/70">
              Investimento total
            </p>
            <p className="font-heading text-5xl font-black tracking-tighter text-foreground">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: currency,
              }).format(total)}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/70">
              Valor consolidado desta proposta. Use os itens para reforçar o
              escopo e a leitura de investimento, não apenas o preço.
            </p>
          </div>

          <div className="space-y-3 border-t border-border/20 pt-6">
            <div className="flex items-center gap-3">
              <Calculator className="size-5 text-brand-primary" weight="bold" />
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/55">
                Leitura comercial
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground/70">
              Propostas mais fortes conectam entrega, impacto e condução. Quando
              o valor aparece sem contexto, a percepção do investimento perde
              força.
            </p>
          </div>
        </aside>
      </section>

      <SectionHeading
        icon={ClockCountdown}
        title="Condições e operação"
        description="Registre como o projeto será conduzido, quais são os próximos passos e qualquer observação relevante para a decisão."
      />

      <section className="grid gap-8 md:grid-cols-2">
        <FieldBlock
          label="Operação pela plataforma"
          value={platformFlow}
          onChange={setPlatformFlow}
          description="Texto padrão de governança para reforçar a centralização da comunicação, aprovações e materiais."
          placeholder="Explique como a plataforma organiza comunicação, aprovações, materiais e acompanhamento."
          presets={PROPOSAL_PRESETS.platformFlow}
          onApplyPreset={(content) =>
            handleApplyPreset(setPlatformFlow, content)
          }
        />
        <FieldBlock
          label="Próximos passos"
          value={nextSteps}
          onChange={setNextSteps}
          placeholder="Ex: aprovação da proposta, assinatura, kickoff e envio dos materiais necessários."
          presets={PROPOSAL_PRESETS.nextSteps}
          onApplyPreset={(content) => handleApplyPreset(setNextSteps, content)}
        />
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <FieldBlock
          label="Observações adicionais"
          value={notes}
          onChange={setNotes}
          placeholder="Ex: materiais que devem ser fornecidos, revisões previstas, itens fora do escopo ou alinhamentos específicos."
        />
      </section>

      <div className="flex items-center justify-end gap-4 border-t border-border/10 pt-8">
        <Button
          onClick={() => router.push("/admin/crm/proposals")}
          variant="ghost"
          className="h-14 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => setShowPreview(true)}
          className="h-14 rounded-2xl bg-brand-primary px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-primary/30 transition-all hover:scale-[1.02] hover:bg-brand-primary/90 active:scale-[0.98]"
        >
          Revisar Proposta
        </Button>
      </div>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}): React.JSX.Element {
  return (
    <div className="space-y-2 border-t border-border/15 pt-10 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-brand-primary" weight="bold" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
          {title}
        </h3>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/70">
        {description}
      </p>
    </div>
  )
}

function FieldBlock({
  label,
  value,
  onChange,
  placeholder,
  description,
  minHeightClassName,
  presets,
  onApplyPreset,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  description?: string
  minHeightClassName?: string
  presets?: ProposalPreset[]
  onApplyPreset?: (content: string) => void
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {label}
        </Label>
        {presets && onApplyPreset ? (
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset.content)}
                className="flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/70 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
              >
                <MagicWand size={10} weight="bold" />
                {preset.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="text-xs leading-relaxed text-muted-foreground/50">
          {description}
        </p>
      ) : null}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${minHeightClassName ?? "min-h-28"} rounded-2xl border-border/40 bg-muted/10 px-5 py-4 text-sm font-medium transition-all focus:border-brand-primary/50 focus:bg-muted/20`}
      />
    </div>
  )
}
