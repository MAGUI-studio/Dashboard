import * as React from "react"

import { ClientPortalActionItem } from "@/src/types/client-portal"
import {
  ArrowRight,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"

interface ClientTaskListProps {
  tasks: ClientPortalActionItem[]
}

export function ClientTaskList({ tasks }: ClientTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-border/30 bg-muted/5 py-20 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          Você não possui solicitações pendentes.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {tasks.map((task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

        return (
          <Card
            key={task.id}
            className="rounded-[2rem] border-border/40 bg-muted/5 transition-all hover:bg-muted/10"
          >
            <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between lg:p-10">
              <div className="flex gap-6">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
                    isOverdue
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-brand-primary/10 text-brand-primary"
                  }`}
                >
                  {isOverdue ? (
                    <WarningCircle weight="duotone" className="size-7" />
                  ) : (
                    <Clock weight="duotone" className="size-7" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                      SOLICITAÇÃO
                    </p>
                    {isOverdue && (
                      <Badge
                        variant="outline"
                        className="h-5 rounded-full border-amber-500/30 bg-amber-500/5 px-2 text-[8px] font-black uppercase tracking-widest text-amber-600"
                      >
                        Atrasado
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                    {task.title}
                  </h2>
                  <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/75">
                    {task.description || "Sem descrição detalhada."}
                  </p>

                  {task.dueDate && (
                    <div className="mt-2 flex items-center gap-2">
                      <Clock
                        weight="bold"
                        className={`size-3.5 ${isOverdue ? "text-amber-500/60" : "text-brand-primary/60"}`}
                      />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? "text-amber-600/80" : "text-brand-primary/80"}`}
                      >
                        Prazo:{" "}
                        {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/40 text-muted-foreground/30 transition-all hover:border-brand-primary/30 hover:text-brand-primary">
                <ArrowRight weight="bold" className="size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
