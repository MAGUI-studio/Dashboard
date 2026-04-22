import * as React from "react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { NotePencil, Target, Users, Megaphone, Lightbulb, ChartLineUp } from "@phosphor-icons/react/dist/ssr"

interface ClientBriefingViewProps {
  briefing: {
    brandTone: string
    visualReferences: string[]
    businessGoals: string
    primaryCta: string
    targetAudience: string
    differentiators: string
  } | null
}

export async function ClientBriefingView({ briefing }: ClientBriefingViewProps) {
  const t = await getTranslations("Briefing.steps")
  
  if (!briefing) return null

  const items = [
    { label: t("brandTone.label"), value: briefing.brandTone, icon: Megaphone },
    { label: t("businessGoals.label"), value: briefing.businessGoals, icon: ChartLineUp },
    { label: t("targetAudience.label"), value: briefing.targetAudience, icon: Users },
    { label: t("primaryCta.label"), value: briefing.primaryCta, icon: Target },
    { label: t("differentiators.label"), value: briefing.differentiators, icon: Lightbulb },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.label} className="rounded-3xl border-border/40 bg-muted/5 p-8 transition-all hover:bg-muted/10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <item.icon weight="duotone" className="size-5" />
              </div>
              <h3 className="font-heading text-base font-black uppercase tracking-tight text-foreground/70">
                {item.label}
              </h3>
            </div>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground/80">
              {item.value || "Não preenchido."}
            </p>
          </div>
        </Card>
      ))}

      {briefing.visualReferences && briefing.visualReferences.length > 0 && (
        <Card className="col-span-full rounded-3xl border-border/40 bg-muted/5 p-8">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <NotePencil weight="duotone" className="size-5" />
              </div>
              <h3 className="font-heading text-base font-black uppercase tracking-tight text-foreground/70">
                {t("visualReferences.label")}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {briefing.visualReferences.map((ref, i) => (
                <a
                  key={i}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-background/50 px-4 py-2 text-[11px] font-bold text-brand-primary ring-1 ring-border/20 transition-all hover:bg-brand-primary hover:text-white"
                >
                  Referência {i + 1}
                </a>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
