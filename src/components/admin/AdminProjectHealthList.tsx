import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export interface AdminProjectHealthItem {
  id: string
  name: string
  clientName: string
  progress: number
  score: number
  summary: string
  tone: "healthy" | "attention" | "risk"
}

const toneStyles = {
  healthy: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  attention: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  risk: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  },
}

export function AdminProjectHealthList({
  items,
}: {
  items: AdminProjectHealthItem[]
}): React.JSX.Element {
  return (
    <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
          Saude dos projetos
        </CardTitle>
        <CardDescription>
          Leitura rapida dos projetos que merecem acompanhamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            Nenhum projeto ativo no momento.
          </div>
        ) : (
          items.map((item) => {
            const tone = toneStyles[item.tone]

            return (
              <div
                key={item.id}
                className="rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <p className="text-base font-black tracking-tight text-foreground">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                      {item.clientName}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    className="rounded-full px-3 text-[10px] font-black uppercase tracking-[0.18em]"
                  >
                    <Link
                      href={{
                        pathname: "/admin/projects/[id]",
                        params: { id: item.id },
                      }}
                    >
                      Abrir
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${tone.dot}`} />
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${tone.text}`}
                      >
                        {item.summary}
                      </span>
                    </div>
                    <span className="text-sm font-black text-foreground/80">
                      {item.score}/100
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                    <div
                      className={`h-full rounded-full ${tone.bar}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                    Progresso declarado: {item.progress}%
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
