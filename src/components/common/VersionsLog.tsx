"use client"

import { useTranslations } from "next-intl"

import { DashboardVersion } from "@/src/types/dashboard"
import {
  ArrowSquareOut,
  ChartBar,
  Eye,
  Lightning,
  Rocket,
  ShieldCheck,
} from "@phosphor-icons/react"

import { cn } from "@/src/lib/utils/utils"

interface VersionsLogProps {
  versions: DashboardVersion[]
}

export function VersionsLog({ versions }: VersionsLogProps): React.JSX.Element {
  const t = useTranslations("Versions")

  if (versions.length === 0) return <div />

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500/10 border-green-500/20"
    if (score >= 50) return "bg-orange-500/10 border-orange-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("title")}
        </h3>
        <p className="text-xs text-muted-foreground/40">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-6">
        {versions.map((version) => (
          <div
            key={version.id}
            className="flex flex-col gap-6 p-8 rounded-3xl border border-border/40 bg-muted/5 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Rocket weight="duotone" size={24} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
                    {version.name}
                  </h4>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Lançada em{" "}
                    {new Date(version.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {version.deployUrl && (
                <a
                  href={version.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10"
                >
                  Visualizar Preview
                  <ArrowSquareOut size={14} weight="bold" />
                </a>
              )}
            </div>

            {version.description && (
              <p className="text-sm font-medium leading-relaxed text-muted-foreground/70 border-l-2 border-border/60 pl-6">
                {version.description}
              </p>
            )}

            {(version.scorePerformance ||
              version.scoreAccessibility ||
              version.scoreBestPractices ||
              version.scoreSEO) && (
              <div className="flex flex-col gap-4 pt-4 border-t border-border/40">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <ChartBar size={14} weight="bold" />
                  {t("performance_title")}
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      key: "performance",
                      score: version.scorePerformance,
                      icon: Lightning,
                    },
                    {
                      key: "accessibility",
                      score: version.scoreAccessibility,
                      icon: ShieldCheck,
                    },
                    {
                      key: "best_practices",
                      score: version.scoreBestPractices,
                      icon: ChartBar,
                    },
                    { key: "seo", score: version.scoreSEO, icon: Eye },
                  ].map(
                    (item) =>
                      item.score !== null && (
                        <div
                          key={item.key}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                            getScoreBg(item.score || 0)
                          )}
                        >
                          <item.icon
                            size={20}
                            weight="duotone"
                            className={getScoreColor(item.score || 0)}
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {t(`scores.${item.key}`)}
                          </span>
                          <span
                            className={cn(
                              "text-2xl font-black tracking-tighter",
                              getScoreColor(item.score || 0)
                            )}
                          >
                            {item.score}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
