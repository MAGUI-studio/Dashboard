import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { ArrowRight, CalendarDots } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export interface AdminAgendaItem {
  id: string
  title: string
  dateLabel: string
  context: string
  href:
    | string
    | {
        pathname: "/admin/projects/[id]" | "/admin/crm"
        params?: { id: string }
      }
}

export function AdminOperationsAgenda({
  items,
}: {
  items: AdminAgendaItem[]
}): React.JSX.Element {
  return (
    <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
          Agenda operacional
        </CardTitle>
        <CardDescription>
          Prazos, retornos e compromissos previstos para os proximos dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            Nenhum compromisso previsto para os proximos 7 dias.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <CalendarDots className="size-5" weight="duotone" />
                </div>
                <div className="grid gap-1">
                  <p className="text-base font-black tracking-tight text-foreground">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    {item.dateLabel}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground/75">
                    {item.context}
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
              >
                <Link href={item.href as never}>
                  Abrir
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
