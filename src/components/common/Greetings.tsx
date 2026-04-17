"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

interface GreetingsProps {
  name: string | null | undefined
}

export function Greetings({ name }: GreetingsProps) {
  const t = useTranslations("Dashboard.greetings")
  const [key, setKey] = React.useState<"morning" | "afternoon" | "evening">(
    "morning"
  )

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setKey("morning")
    } else if (hour >= 12 && hour < 18) {
      setKey("afternoon")
    } else {
      setKey("evening")
    }
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
        {t(key, { name: name || "User" })}
      </h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 leading-relaxed">
        {t("track_evolution")}
      </p>
    </div>
  )
}
