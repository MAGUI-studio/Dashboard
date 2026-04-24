"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Plus, Trash } from "@phosphor-icons/react"

import { StepId } from "@/src/hooks/use-briefing-form"

interface BriefingStepEditorProps {
  currentStepId: StepId
  formData: Record<string, unknown>
  onValueChange: (v: unknown) => void
}

export function BriefingStepEditor({
  currentStepId,
  formData,
  onValueChange,
}: BriefingStepEditorProps) {
  const t = useTranslations("Briefing")
  const value = formData[currentStepId]

  // Render Generic List Input (References, Competitors, Perceptions)
  const renderListInput = (list: string[], label: string) => (
    <div className="space-y-6">
      {list.map((item, i) => (
        <div key={i} className="group relative flex items-center">
          <span className="absolute left-0 font-mono text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
            {label}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const n = [...list]
              n[i] = e.target.value
              onValueChange(n)
            }}
            placeholder="..."
            className="w-full bg-transparent border-b border-border/30 pl-12 pr-12 py-6 text-xl text-foreground font-medium focus:border-brand-primary outline-none"
          />
          {list.length > 1 && (
            <button
              onClick={() => {
                const n = [...list]
                n.splice(i, 1)
                onValueChange(n.length ? n : [""])
              }}
              className="absolute right-0 size-10 text-muted-foreground/20 hover:text-destructive"
            >
              <Trash size={20} weight="fill" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onValueChange([...list, ""])}
        className="group mt-8 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary hover:opacity-70"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary/10">
          <Plus size={14} weight="bold" />
        </div>
        {t("add_item", { fallback: "Adicionar Item" })}
      </button>
    </div>
  )

  // 1. Branding Palette Editor
  if (currentStepId === "palette") {
    const p = value || { primary: "#000000", secondary: "#FFFFFF", accent: "" }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Cor Principal (HEX)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={p.primary}
              onChange={(e) => onValueChange({ ...p, primary: e.target.value })}
              className="size-16 rounded-2xl cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={p.primary}
              onChange={(e) => onValueChange({ ...p, primary: e.target.value })}
              className="bg-transparent border-b border-border/40 text-2xl font-bold uppercase outline-none focus:border-brand-primary"
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Cor Secundária (HEX)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={p.secondary}
              onChange={(e) =>
                onValueChange({ ...p, secondary: e.target.value })
              }
              className="size-16 rounded-2xl cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={p.secondary}
              onChange={(e) =>
                onValueChange({ ...p, secondary: e.target.value })
              }
              className="bg-transparent border-b border-border/40 text-2xl font-bold uppercase outline-none focus:border-brand-primary"
            />
          </div>
        </div>
      </div>
    )
  }

  // 2. Typography Editor
  if (currentStepId === "typography") {
    const ty = value || { primary: "", secondary: "" }
    return (
      <div className="space-y-12 pt-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Tipografia Principal (Nome da Fonte)
          </label>
          <input
            type="text"
            value={ty.primary}
            onChange={(e) => onValueChange({ ...ty, primary: e.target.value })}
            placeholder="Ex: Inter, Montserrat..."
            className="w-full bg-transparent border-b border-border/40 text-3xl font-bold outline-none focus:border-brand-primary pb-4"
          />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Tipografia Secundária
          </label>
          <input
            type="text"
            value={ty.secondary}
            onChange={(e) =>
              onValueChange({ ...ty, secondary: e.target.value })
            }
            placeholder="Ex: Roboto Mono..."
            className="w-full bg-transparent border-b border-border/40 text-3xl font-bold outline-none focus:border-brand-primary pb-4"
          />
        </div>
      </div>
    )
  }

  // 3. Infrastructure Editor
  if (currentStepId === "infrastructure") {
    const infra = value || { domain: "", hosting: "", analytics: "" }
    return (
      <div className="space-y-12 pt-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Domínio / URL Atual
          </label>
          <input
            type="text"
            value={infra.domain}
            onChange={(e) =>
              onValueChange({ ...infra, domain: e.target.value })
            }
            placeholder="www.suaempresa.com.br"
            className="w-full bg-transparent border-b border-border/40 text-2xl font-bold outline-none focus:border-brand-primary pb-4"
          />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Hospedagem / Painel Atual
          </label>
          <input
            type="text"
            value={infra.hosting}
            onChange={(e) =>
              onValueChange({ ...infra, hosting: e.target.value })
            }
            placeholder="Ex: AWS, Vercel, Hostgator..."
            className="w-full bg-transparent border-b border-border/40 text-2xl font-bold outline-none focus:border-brand-primary pb-4"
          />
        </div>
      </div>
    )
  }

  // 4. Governance Editor
  if (currentStepId === "governance") {
    const gov = value || { primaryApprover: "", financialApprover: "" }
    return (
      <div className="space-y-12 pt-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Aprovador Principal (Nome Completo)
          </label>
          <input
            type="text"
            value={gov.primaryApprover}
            onChange={(e) =>
              onValueChange({ ...gov, primaryApprover: e.target.value })
            }
            className="w-full bg-transparent border-b border-border/40 text-3xl font-bold outline-none focus:border-brand-primary pb-4"
          />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Aprovador Financeiro
          </label>
          <input
            type="text"
            value={gov.financialApprover}
            onChange={(e) =>
              onValueChange({ ...gov, financialApprover: e.target.value })
            }
            className="w-full bg-transparent border-b border-border/40 text-3xl font-bold outline-none focus:border-brand-primary pb-4"
          />
        </div>
      </div>
    )
  }

  // List Inputs
  if (
    [
      "visualReferences",
      "dislikedReferences",
      "competitors",
      "desiredPerceptions",
    ].includes(currentStepId)
  ) {
    return renderListInput(
      value || [""],
      currentStepId.substring(0, 3).toUpperCase()
    )
  }

  // Default TextArea
  return (
    <textarea
      value={value as string}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full min-h-[300px] resize-none bg-transparent text-2xl font-medium leading-relaxed text-foreground placeholder:text-muted-foreground/20 focus:outline-none xl:text-3xl"
      placeholder="Escreva sua resposta aqui..."
      autoFocus
    />
  )
}
