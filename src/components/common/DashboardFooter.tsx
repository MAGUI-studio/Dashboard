"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import { ArrowUpRight } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

import { Logo } from "@/src/components/common/logo"

export function DashboardFooter(): React.JSX.Element {
  const t = useTranslations("Dashboard.footer")

  return (
    <footer className="mt-auto border-t border-border/20 bg-background/35 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-440 flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="transition hover:opacity-75">
            <Logo width={124} height={28} priority={false} />
          </Link>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="h-10 w-max rounded-full border border-border/25 bg-background/40 px-4 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-foreground/70 hover:bg-background/70"
        >
          {t("back_to_top")}
          <ArrowUpRight weight="bold" className="ml-2 size-3.5" />
        </Button>
      </div>
    </footer>
  )
}
