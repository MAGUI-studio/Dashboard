"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  CurrencyCircleDollar,
  ListChecks,
  Plus,
  Signature,
  Trash,
  User,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"

import { createDocumentAction } from "@/src/lib/actions/document.actions"
import { cn } from "@/src/lib/utils/utils"

interface DocumentFormProps {
  clients: Array<{ id: string; name: string | null }>
  projects: Array<{ id: string; name: string; client: { name: string | null } }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any
}

export function DocumentForm({ clients, projects }: DocumentFormProps) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    type: "CONTRACT",
    title: "",
    clientId: "",
    projectId: "",
    contractedData: {
      legalName: "MAGUI.studio LTDA",
      tradeName: "MAGUI.studio",
      document: "00.000.000/0001-00",
      email: "financeiro@magui.studio",
      address: "Rua Exemplo, 123 - São Paulo/SP",
    },
    contractingData: {
      legalName: "",
      tradeName: "",
      document: "",
      email: "",
      address: "",
    },
    commercialData: {
      totalValue: 0,
      installments: 1,
      revisions: 2,
    },
    clauses: [
      {
        id: "1",
        title: "Objeto",
        content:
          "O presente contrato tem como objeto a prestação de serviços de...",
        order: 0,
        isRequired: true,
        subclauses: [],
      },
      {
        id: "2",
        title: "Valor e Pagamento",
        content: "Pelo serviço objeto deste contrato, a CONTRATANTE pagará...",
        order: 1,
        isRequired: true,
        subclauses: [],
      },
    ],
    signers: [
      {
        name: "Guilherme Bustamante",
        email: "guilherme@magui.studio",
        role: "CONTRACTOR",
      },
    ],
  })

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createDocumentAction(formData as any)
      if (result.success) {
        toast.success("Documento criado com sucesso!")
        router.push(`/admin/documents/${result.documentId}`)
      } else {
        toast.error(result.error || "Erro ao criar documento")
      }
    } catch {
      toast.error("Erro inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-12 flex items-center justify-between gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {[
        { id: 1, label: "Contexto", icon: Briefcase },
        { id: 2, label: "Partes", icon: User },
        { id: 3, label: "Comercial", icon: CurrencyCircleDollar },
        { id: 4, label: "Cláusulas", icon: ListChecks },
        { id: 5, label: "Signatários", icon: Signature },
      ].map((s) => (
        <div key={s.id} className="flex items-center gap-4 shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all border",
              step === s.id
                ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                : "bg-muted/5 border-border/40 text-muted-foreground/40"
            )}
          >
            <s.icon
              weight={step === s.id ? "fill" : "bold"}
              className="size-4"
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {s.label}
            </span>
          </div>
          {s.id < 5 && <div className="h-px w-8 bg-border/40" />}
        </div>
      ))}
    </div>
  )

  return (
    <div className="w-full">
      {renderStepIndicator()}

      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FieldGroup className="gap-8">
              <FieldSet>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      Tipo de Documento
                    </FieldLabel>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger className="h-12 w-full rounded-full border-border/40 bg-muted/15 px-6 font-bold text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONTRACT">
                          Contrato de Serviço
                        </SelectItem>
                        <SelectItem value="NDA">
                          Termo de Confidencialidade (NDA)
                        </SelectItem>
                        <SelectItem value="AMENDMENT">
                          Aditivo Contratual
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      Título do Documento
                    </FieldLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Contrato de Desenvolvimento Web - Nome do Projeto"
                      className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      Cliente
                    </FieldLabel>
                    <Select
                      value={formData.clientId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, clientId: v })
                      }
                    >
                      <SelectTrigger className="h-12 w-full rounded-full border-border/40 bg-muted/15 px-6 font-bold text-foreground">
                        <SelectValue placeholder="Selecione um cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      Projeto Relacionado
                    </FieldLabel>
                    <Select
                      value={formData.projectId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, projectId: v })
                      }
                    >
                      <SelectTrigger className="h-12 w-full rounded-full border-border/40 bg-muted/15 px-6 font-bold text-foreground">
                        <SelectValue placeholder="Opcional..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Briefcase weight="fill" className="size-4" />
                  </div>
                  <h3 className="font-heading text-xl font-black uppercase tracking-tight">
                    Contratada (MAGUI)
                  </h3>
                </div>
                <div className="space-y-4 p-6 rounded-[1.8rem] border border-border/40 bg-background/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {formData.contractedData.legalName}
                  </p>
                  <p className="text-xs font-bold">
                    {formData.contractedData.document}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.contractedData.address}
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <User weight="fill" className="size-4" />
                  </div>
                  <h3 className="font-heading text-xl font-black uppercase tracking-tight">
                    Contratante
                  </h3>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Razão Social / Nome Completo"
                    value={formData.contractingData.legalName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractingData: {
                          ...formData.contractingData,
                          legalName: e.target.value,
                        },
                      })
                    }
                    className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                  />
                  <Input
                    placeholder="CPF / CNPJ"
                    value={formData.contractingData.document}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractingData: {
                          ...formData.contractingData,
                          document: e.target.value,
                        },
                      })
                    }
                    className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                  />
                  <Input
                    placeholder="E-mail principal"
                    value={formData.contractingData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractingData: {
                          ...formData.contractingData,
                          email: e.target.value,
                        },
                      })
                    }
                    className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                  />
                  <Textarea
                    placeholder="Endereço Completo"
                    value={formData.contractingData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractingData: {
                          ...formData.contractingData,
                          address: e.target.value,
                        },
                      })
                    }
                    className="rounded-[1.5rem] border-border/40 bg-muted/10 p-6 font-bold"
                  />
                </div>
              </section>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FieldGroup className="gap-8">
              <FieldSet>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      Valor Total do Contrato
                    </FieldLabel>
                    <InputGroup className="h-12 rounded-full border-border/40 bg-muted/10">
                      <InputGroupAddon>R$</InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        value={formData.commercialData.totalValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commercialData: {
                              ...formData.commercialData,
                              totalValue: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      Número de Parcelas
                    </FieldLabel>
                    <Input
                      type="number"
                      value={formData.commercialData.installments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commercialData: {
                            ...formData.commercialData,
                            installments: Number(e.target.value),
                          },
                        })
                      }
                      className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                    />
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
                Builder de Cláusulas
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-4 text-[10px] font-black uppercase"
                onClick={() => {
                  const newClause = {
                    id: String(Date.now()),
                    title: "Nova Cláusula",
                    content: "",
                    order: formData.clauses.length,
                    isRequired: true,
                    subclauses: [],
                  }
                  setFormData({
                    ...formData,
                    clauses: [...formData.clauses, newClause],
                  })
                }}
              >
                <Plus className="mr-2 size-4" /> Adicionar Cláusula
              </Button>
            </div>

            <div className="space-y-4">
              {formData.clauses.map((clause, idx) => (
                <Card
                  key={clause.id}
                  className="rounded-[2rem] border-border/40 bg-background/40 p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <Input
                      value={clause.title}
                      onChange={(e) => {
                        const n = [...formData.clauses]
                        n[idx].title = e.target.value
                        setFormData({ ...formData, clauses: n })
                      }}
                      className="border-none bg-transparent p-0 text-lg font-black uppercase tracking-tight shadow-none focus-visible:ring-0"
                    />
                    <button
                      className="text-muted-foreground/20 hover:text-destructive transition-colors"
                      onClick={() => {
                        const n = [...formData.clauses]
                        n.splice(idx, 1)
                        setFormData({ ...formData, clauses: n })
                      }}
                    >
                      <Trash size={20} weight="fill" />
                    </button>
                  </div>
                  <Textarea
                    value={clause.content}
                    onChange={(e) => {
                      const n = [...formData.clauses]
                      n[idx].content = e.target.value
                      setFormData({ ...formData, clauses: n })
                    }}
                    className="min-h-[100px] border-none bg-transparent p-0 text-sm font-medium leading-relaxed shadow-none focus-visible:ring-0 resize-none"
                    placeholder="Escreva o conteúdo da cláusula..."
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
                Signatários
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-4 text-[10px] font-black uppercase"
                onClick={() => {
                  const newSigner = { name: "", email: "", role: "CLIENT" }
                  setFormData({
                    ...formData,
                    signers: [...formData.signers, newSigner],
                  })
                }}
              >
                <Plus className="mr-2 size-4" /> Adicionar Signatário
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.signers.map((signer, idx) => (
                <Card
                  key={idx}
                  className="rounded-2xl border-border/40 bg-background/40 p-6 relative"
                >
                  <div className="space-y-4">
                    <Input
                      placeholder="Nome Completo"
                      value={signer.name}
                      onChange={(e) => {
                        const n = [...formData.signers]
                        n[idx].name = e.target.value
                        setFormData({ ...formData, signers: n })
                      }}
                      className="h-10 rounded-full border-border/40 bg-muted/10 px-4 font-bold text-xs"
                    />
                    <Input
                      placeholder="E-mail"
                      value={signer.email}
                      onChange={(e) => {
                        const n = [...formData.signers]
                        n[idx].email = e.target.value
                        setFormData({ ...formData, signers: n })
                      }}
                      className="h-10 rounded-full border-border/40 bg-muted/10 px-4 font-bold text-xs"
                    />
                  </div>
                  {formData.signers.length > 1 && (
                    <button
                      className="absolute top-2 right-2 text-muted-foreground/10 hover:text-destructive"
                      onClick={() => {
                        const n = [...formData.signers]
                        n.splice(idx, 1)
                        setFormData({ ...formData, signers: n })
                      }}
                    >
                      <Trash size={16} weight="fill" />
                    </button>
                  )}
                </Card>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-[2.5rem] bg-brand-primary/[0.03] border border-brand-primary/20 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle
                  weight="fill"
                  className="size-6 text-brand-primary"
                />
                <h4 className="font-heading text-lg font-black uppercase tracking-tight">
                  Tudo pronto?
                </h4>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Ao clicar em &quot;Gerar Documento&quot;, o sistema irá criar o
                contrato estruturado, gerar a primeira versão e prepará-lo para
                envio via Autentique. Você poderá revisar o PDF na próxima tela.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between pt-8 border-t border-border/40">
        <Button
          variant="ghost"
          disabled={step === 1 || isSubmitting}
          onClick={handleBack}
          className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="mr-2 size-4" /> Voltar
        </Button>

        {step < 5 ? (
          <Button
            onClick={handleNext}
            className="h-14 rounded-full px-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Próxima Etapa <ArrowRight className="ml-2 size-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-14 rounded-full px-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                Gerar Documento{" "}
                <CheckCircle weight="fill" className="ml-2 size-5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
