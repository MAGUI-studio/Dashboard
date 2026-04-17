"use client"

import * as React from "react"

import { DashboardNotification } from "@/src/types/dashboard"
import {
  BellRinging,
  CheckCircle,
  ClockCounterClockwise,
} from "@phosphor-icons/react"

import { cn, formatLocalTime } from "@/src/lib/utils/utils"

interface NotificationsPanelProps {
  notifications: DashboardNotification[]
}

export function NotificationsPanel({
  notifications,
}: NotificationsPanelProps): React.JSX.Element {
  if (notifications.length === 0) {
    return (
      <section className="rounded-[2rem] border border-dashed border-border/40 bg-muted/10 p-8">
        <div className="flex items-center gap-3 text-muted-foreground/50">
          <BellRinging className="size-5" weight="duotone" />
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            Nenhuma notificação recente
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] border border-border/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))] p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
            Radar do Cliente
          </p>
          <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight">
            Sinais do projeto
          </h3>
        </div>
        <div className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
          {notifications.length} eventos
        </div>
      </div>

      <div className="grid gap-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "rounded-3xl border p-4 transition-all",
              notification.readAt
                ? "border-border/30 bg-muted/10"
                : "border-brand-primary/30 bg-brand-primary/5"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex size-10 items-center justify-center rounded-2xl",
                  notification.readAt
                    ? "bg-muted text-muted-foreground"
                    : "bg-brand-primary/15 text-brand-primary"
                )}
              >
                {notification.readAt ? (
                  <CheckCircle className="size-5" weight="duotone" />
                ) : (
                  <BellRinging className="size-5" weight="duotone" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black uppercase tracking-tight text-foreground">
                    {notification.title}
                  </h4>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    <ClockCounterClockwise className="size-3" weight="bold" />
                    {formatLocalTime(
                      new Date(notification.createdAt),
                      "America/Sao_Paulo"
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
