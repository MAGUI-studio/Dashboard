"use client"

import { useTranslations } from "next-intl"

import { DashboardActionItem } from "@/src/types/dashboard"
import { ArrowRight, Clock, WarningCircle } from "@phosphor-icons/react"

interface ActionItemsWidgetProps {
  items: DashboardActionItem[]
}

export function ActionItemsWidget({
  items,
}: ActionItemsWidgetProps): React.JSX.Element {
  const t = useTranslations("ActionItems")

  if (items.length === 0) return <div />

  const pendingItems = items.filter((i) => i.status === "PENDING")

  if (pendingItems.length === 0) return <div />

  return (
    <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
          {t("title")}
        </h3>
        <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
          {t("waiting")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col gap-4 p-6 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 backdrop-blur-md overflow-hidden transition-all hover:border-brand-primary/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                <WarningCircle weight="fill" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight text-foreground">
                  {item.title}
                </span>
                {item.dueDate && (
                  <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} weight="bold" />
                    Prazo: {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {item.description && (
              <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed">
                {item.description}
              </p>
            )}

            <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={20} className="text-brand-primary" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
