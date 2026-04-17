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
      <section className="rounded-4xl border border-dashed border-border/40 bg-muted/5 p-10 flex flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/20 text-muted-foreground/30 mb-4">
          <BellRinging className="size-6" weight="duotone" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          Sem notificações
        </p>
      </section>
    )
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <section className="rounded-4xl border border-border/30 bg-background/20 p-8 backdrop-blur-xl shadow-2xl shadow-black/5">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-brand-primary">
            Sinais
          </p>
          <h3 className="mt-1 font-heading text-xl font-black uppercase tracking-tight text-foreground/90">
            Radar
          </h3>
        </div>
        {unreadCount > 0 && (
          <div className="rounded-full bg-brand-primary px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white animate-pulse">
            {unreadCount} novos
          </div>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "group relative overflow-hidden transition-all",
              !notification.readAt &&
                "after:absolute after:left-0 after:top-0 after:h-full after:w-0.5 after:bg-brand-primary"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4
                    className={cn(
                      "text-[11px] font-black uppercase tracking-tight transition-colors",
                      notification.readAt
                        ? "text-muted-foreground/60"
                        : "text-foreground"
                    )}
                  >
                    {notification.title}
                  </h4>
                  <span className="shrink-0 font-mono text-[8px] font-bold uppercase text-muted-foreground/30">
                    {formatLocalTime(
                      new Date(notification.createdAt),
                      "America/Sao_Paulo"
                    )}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground/50 line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </div>
            <div className="mt-4 h-[1px] w-full bg-border/20 group-last:hidden" />
          </div>
        ))}
      </div>
    </section>
  )
}
