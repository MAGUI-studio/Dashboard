"use client"

import * as React from "react"

import { Prisma } from "@/src/generated/client"
import {
  ArrowClockwise,
  Briefcase,
  ChatCircleDots,
  Eye,
  FileText,
  Globe,
  Palette,
  ShieldCheck,
  TextT,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"

import { resetProjectBriefingAction } from "@/src/lib/actions/project.actions"

interface ProjectBriefingTabProps {
  projectId: string
  briefing: Prisma.JsonValue // Json from Prisma
}

export function ProjectBriefingTab({
  projectId,
  briefing,
}: ProjectBriefingTabProps) {
  const [isResetting, setIsResetting] = React.useState(false)
  const [showResetConfirm, setShowResetConfirm] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (briefing as any) || {}

  const handleReset = async () => {
    setIsResetting(true)
    const result = await resetProjectBriefingAction(projectId)

    if (result.success) {
      toast.success("Briefing resetado com sucesso")
      setShowResetConfirm(false)
    } else {
      toast.error(result.error || "Erro ao resetar briefing")
    }
    setIsResetting(false)
  }

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-xl font-black uppercase tracking-tight">
          {title}
        </h3>
      </div>
    </div>
  )

  const renderField = (
    label: string,
    value: unknown,
    type: "text" | "list" | "color" = "text"
  ) => {
    const isEmpty = !value || (Array.isArray(value) && value.length === 0)

    return (
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          {label}
        </span>
        {isEmpty ? (
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground/20 italic">
            Não fornecido
          </p>
        ) : (
          <>
            {type === "text" && (
              <p className="text-sm font-medium leading-relaxed text-foreground/80">
                {String(value)}
              </p>
            )}
            {type === "list" && Array.isArray(value) && (
              <div className="flex flex-wrap gap-2">
                {value.map((item: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-muted/10 border-border/40 text-[10px] font-bold"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (!briefing || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <FileText className="size-16 mb-4" />
        <p className="font-heading text-xl font-black uppercase tracking-tight">
          Briefing não iniciado
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest mt-1">
          O cliente ainda não preencheu os detalhes iniciais.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Header com Ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
            Ficha Estratégica do Projeto
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive font-mono text-[10px] font-black uppercase tracking-widest gap-2"
        >
          <ArrowClockwise className="size-3" />
          Solicitar Novo Preenchimento
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Estratégia e Negócio */}
        <div className="xl:col-span-8 space-y-12">
          {/* Contexto de Negócio */}
          <section>
            {renderSectionHeader(
              <Briefcase weight="fill" className="size-5" />,
              "Contexto de Negócio"
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-[2rem] border border-border/40 bg-background/40">
              <div className="md:col-span-2">
                {renderField("Sobre o Negócio", data.businessDescription)}
              </div>
              {renderField("Essência da Marca", data.brandTone)}
              {renderField("Objetivos do Projeto", data.businessGoals)}
              {renderField("Público-Alvo", data.targetAudience)}
              {renderField("Diferenciais", data.differentiators)}
              <div className="md:col-span-2">
                {renderField("Conversão Principal (CTA)", data.primaryCta)}
              </div>
            </div>
          </section>

          {/* Direção Visual */}
          <section>
            {renderSectionHeader(
              <Eye weight="fill" className="size-5" />,
              "Direção Visual"
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-[2rem] border border-border/40 bg-background/40">
              {renderField(
                "Referências Visuais",
                data.visualReferences,
                "list"
              )}
              {renderField("O que evitar", data.dislikedReferences, "list")}
              {renderField("Concorrentes", data.competitors, "list")}
              {renderField(
                "Percepção Desejada",
                data.desiredPerceptions,
                "list"
              )}
            </div>
          </section>
        </div>

        {/* Coluna Direita: Identidade, Infra e Operacional */}
        <div className="xl:col-span-4 space-y-8">
          {/* Identidade Visual */}
          <Card className="rounded-[2rem] border-border/40 bg-background/40 overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Palette weight="fill" className="size-5 text-brand-primary" />
                <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                  Identidade
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Paleta de Cores
                </span>
                <div className="flex items-center gap-3">
                  {data.palette?.primary ? (
                    <div className="group relative">
                      <div
                        className="size-12 rounded-xl border border-border/40 shadow-sm"
                        style={{ backgroundColor: data.palette.primary }}
                      />
                      <span className="absolute -bottom-5 left-0 text-[8px] font-bold uppercase">
                        {data.palette.primary}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 italic">
                      Nenhuma cor definida
                    </p>
                  )}
                  {data.palette?.secondary && (
                    <div className="group relative">
                      <div
                        className="size-12 rounded-xl border border-border/40 shadow-sm"
                        style={{ backgroundColor: data.palette.secondary }}
                      />
                      <span className="absolute -bottom-5 left-0 text-[8px] font-bold uppercase">
                        {data.palette.secondary}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-border/40" />

              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Tipografia
                </span>
                <div className="space-y-3">
                  {data.typography?.primary ? (
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted/20">
                        <TextT className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                          Principal
                        </p>
                        <p className="text-sm font-black uppercase tracking-tight">
                          {data.typography.primary}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 italic">
                      Fonte não informada
                    </p>
                  )}
                  {data.typography?.secondary && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted/20">
                        <TextT className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                          Secundária
                        </p>
                        <p className="text-sm font-black uppercase tracking-tight">
                          {data.typography.secondary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infraestrutura */}
          <Card className="rounded-[2rem] border-border/40 bg-background/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe weight="fill" className="size-5 text-brand-primary" />
                <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                  Infraestrutura
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.infrastructure?.domain ? (
                <div className="p-4 rounded-2xl bg-muted/10 border border-border/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                    Domínio
                  </p>
                  <p className="text-xs font-bold text-brand-primary truncate">
                    {data.infrastructure.domain}
                  </p>
                </div>
              ) : (
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 italic px-2">
                  Domínio não configurado
                </p>
              )}
              {data.infrastructure?.hosting && (
                <div className="p-4 rounded-2xl bg-muted/10 border border-border/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                    Hospedagem
                  </p>
                  <p className="text-xs font-bold">
                    {data.infrastructure.hosting}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Governança */}
          <Card className="rounded-[2rem] border-border/40 bg-background/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck
                  weight="fill"
                  className="size-5 text-brand-primary"
                />
                <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                  Governança
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.governance?.primaryApprover ? (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">
                    Aprovador Principal
                  </p>
                  <p className="text-xs font-black uppercase tracking-tight text-emerald-900 dark:text-emerald-100">
                    {data.governance.primaryApprover}
                  </p>
                </div>
              ) : (
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 italic px-2">
                  Aprovador não definido
                </p>
              )}
              {data.governance?.financialApprover && (
                <div className="p-4 rounded-2xl bg-muted/10 border border-border/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                    Financeiro
                  </p>
                  <p className="text-xs font-bold uppercase">
                    {data.governance.financialApprover}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 px-2 text-[10px] font-bold text-muted-foreground/60">
                <ChatCircleDots className="size-3.5" />
                COMUNICAÇÃO:{" "}
                {data.governance?.preferredCommunication || "PLATAFORMA"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
              Solicitar Novo Briefing
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
              Esta ação <strong className="text-destructive">apagará</strong>{" "}
              todos os dados atuais de briefing deste projeto e solicitará que o
              cliente preencha novamente. O cliente receberá uma notificação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-full border-border/40 text-xs font-bold uppercase tracking-widest hover:bg-muted/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="rounded-full bg-destructive text-xs font-bold uppercase tracking-widest text-white hover:bg-destructive/90"
            >
              {isResetting ? "Limpando..." : "Confirmar e Resetar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
