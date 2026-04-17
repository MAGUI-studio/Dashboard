"use client"

import * as React from "react"

import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
  XCircle,
} from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps): React.JSX.Element {
  return (
    <Sonner
      theme="system"
      position="top-right"
      closeButton
      expand
      visibleToasts={5}
      icons={{
        success: <CheckCircle weight="fill" className="size-5" />,
        info: <Info weight="fill" className="size-5" />,
        warning: <WarningCircle weight="fill" className="size-5" />,
        error: <XCircle weight="fill" className="size-5" />,
        close: <X weight="bold" className="size-4" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group relative overflow-hidden rounded-[1.6rem] border border-border/50 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_94%,white_6%),color-mix(in_oklab,var(--background)_98%,black_2%))] p-0 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl",
          title:
            "font-heading text-[11px] font-black uppercase tracking-[0.24em] text-foreground",
          description:
            "mt-2 font-sans text-[12px] font-medium leading-relaxed text-muted-foreground",
          content: "px-5 py-4 pr-12",
          icon: "mt-0.5 text-brand-primary shrink-0",
          closeButton:
            "left-auto right-4 top-4 flex size-8 items-center justify-center rounded-full border border-border/50 bg-background/70 text-muted-foreground transition-all hover:border-brand-primary/25 hover:bg-background hover:text-foreground",
          actionButton:
            "rounded-full bg-brand-primary px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:bg-brand-primary/90",
          cancelButton:
            "rounded-full border border-border/50 bg-background/60 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground transition-all hover:bg-background hover:text-foreground",
          success:
            "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-emerald-400 after:absolute after:right-0 after:top-0 after:h-px after:w-full after:bg-emerald-400/20",
          error:
            "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-red-500 after:absolute after:right-0 after:top-0 after:h-px after:w-full after:bg-red-500/20",
          warning:
            "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-amber-400 after:absolute after:right-0 after:top-0 after:h-px after:w-full after:bg-amber-400/20",
          info: "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-brand-primary after:absolute after:right-0 after:top-0 after:h-px after:w-full after:bg-brand-primary/20",
        },
      }}
      {...props}
    />
  )
}
