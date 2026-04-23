"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Plus, Trash } from "@phosphor-icons/react"

import { StepId } from "@/src/hooks/use-briefing-form"

interface BriefingStepEditorProps {
  currentStepId: StepId
  formData: Record<string, unknown>
  onValueChange: (v: string | string[]) => void
}

export function BriefingStepEditor({
  currentStepId,
  formData,
  onValueChange,
}: BriefingStepEditorProps) {
  const t = useTranslations("Briefing")
  const value = formData[currentStepId]

  if (currentStepId === "visualReferences") {
    const refs = value as string[]
    return (
      <div className="space-y-6">
        {refs.map((ref, i) => (
          <div key={i} className="group relative flex items-center">
            <span className="absolute left-0 font-mono text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
              REF
            </span>
            <input
              type="url"
              value={ref}
              onChange={(e) => {
                const n = [...refs]
                n[i] = e.target.value
                onValueChange(n)
              }}
              placeholder="https://..."
              className="w-full bg-transparent border-b border-border/30 pl-12 pr-12 py-6 text-xl text-foreground font-medium focus:border-brand-primary outline-none"
            />
            {refs.length > 1 && (
              <button
                onClick={() => {
                  const n = [...refs]
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
          onClick={() => onValueChange([...refs, ""])}
          className="group mt-8 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary hover:opacity-70"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary/10">
            <Plus size={14} weight="bold" />
          </div>{" "}
          {t("add_reference")}
        </button>
      </div>
    )
  }

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
