"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Plus, Trash } from "@phosphor-icons/react"
import { HexColorPicker } from "react-colorful"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

import { StepId } from "@/src/hooks/use-briefing-form"

import { LogoUploadEditor } from "./LogoUploadEditor"

interface BriefingStepEditorProps {
  currentStepId: StepId
  formData: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

export function BriefingStepEditor({
  currentStepId,
  formData,
  setFormData,
}: BriefingStepEditorProps) {
  const t = useTranslations("Briefing")
  const value = formData[currentStepId]
  const onValueChange = (v: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((f: any) => ({ ...f, [currentStepId]: v }))
  }

  // Render Generic List Input (References, Competitors, Perceptions)
  const renderListInput = (list: string[]) => (
    <div className="space-y-6">
      {list.map((item, i) => (
        <div key={i} className="group relative flex items-center">
          <span className="absolute left-0 font-mono text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
            {t(`steps.${currentStepId}.label`)}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const n = [...list]
              n[i] = e.target.value
              onValueChange(n)
            }}
            placeholder={t(`steps.${currentStepId}.placeholder`)}
            className="w-full bg-transparent border-b border-border/30 pl-48 pr-12 py-6 text-xl text-foreground font-medium focus:border-brand-primary outline-none"
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
    const p = formData.palette || {
      primary: "#000000",
      secondary: "#FFFFFF",
      accent: "",
    }
    return (
      <div className="space-y-12 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Cor Principal (HEX)
            </label>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-16 rounded-2xl cursor-pointer bg-transparent border-2 border-border/20"
                    style={{ backgroundColor: p.primary }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <HexColorPicker
                    color={p.primary}
                    onChange={(color) =>
                      setFormData({
                        ...formData,
                        palette: { ...p, primary: color },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={p.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    palette: { ...p, primary: e.target.value },
                  })
                }
                className="bg-transparent border-b border-border/40 text-2xl font-bold uppercase outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Cor Secundária (HEX)
            </label>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-16 rounded-2xl cursor-pointer bg-transparent border-2 border-border/20"
                    style={{ backgroundColor: p.secondary }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <HexColorPicker
                    color={p.secondary}
                    onChange={(color) =>
                      setFormData({
                        ...formData,
                        palette: { ...p, secondary: color },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={p.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    palette: { ...p, secondary: e.target.value },
                  })
                }
                className="bg-transparent border-b border-border/40 text-2xl font-bold uppercase outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logo Uploader
  if (currentStepId === "logos") {
    return (
      <LogoUploadEditor
        value={
          formData.logos as { primary: string | null; secondary: string | null }
        }
        onValueChange={(v) => setFormData({ ...formData, logos: v })}
      />
    )
  }

  // List Inputs
  if (
    ["visualReferences", "dislikedReferences", "competitors"].includes(
      currentStepId
    )
  ) {
    return renderListInput((value as string[]) || [""])
  }

  // Default TextArea
  return (
    <textarea
      value={value as string}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full min-h-[300px] resize-none bg-transparent text-2xl font-medium leading-relaxed text-foreground placeholder:text-muted-foreground/20 focus:outline-none xl:text-3xl"
      placeholder={t("answer_label")}
      autoFocus
    />
  )
}
