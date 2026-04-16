import * as React from "react"

import { getTranslations } from "next-intl/server"

import { auth } from "@clerk/nextjs/server"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

import prisma from "@/src/lib/prisma"
import { cn } from "@/src/lib/utils/utils"

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard")
  const { userId } = await auth()

  if (!userId) return <div />

  // Fetch project for the current user
  const userWithProject = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      projects: {
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
          },
        },
        take: 1, // Focus on the most recent project for now
      },
    },
  })

  const project = userWithProject?.projects[0]

  if (!project) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading text-2xl font-black uppercase tracking-tight opacity-20">
          {t("no_project")}
        </h2>
      </main>
    )
  }

  const statusSteps = [
    "STRATEGY",
    "ARCHITECTURE",
    "DESIGN",
    "ENGINEERING",
    "QA",
    "LAUNCHED",
  ]
  const currentStatusIndex = statusSteps.indexOf(project.status)

  return (
    <main className="relative flex min-h-svh flex-col bg-background/50 p-6 lg:p-12">
      <div className="flex flex-col gap-12 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            {project.name}
          </h1>
        </div>

        {/* Protocol Status Bar */}
        <section className="flex flex-col gap-8 rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("status.title")}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                {project.progress}% {t("status.progress")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStatusIndex
              const isCurrent = index === currentStatusIndex

              return (
                <div
                  key={step}
                  className={cn(
                    "flex flex-col gap-3 p-4 rounded-2xl border transition-all",
                    isCurrent
                      ? "bg-brand-primary/10 border-brand-primary/40 shadow-lg shadow-brand-primary/5"
                      : "border-border/20 bg-muted/5",
                    isCompleted && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    {isCompleted ? (
                      <CheckCircle
                        weight="fill"
                        className="size-4 text-brand-primary"
                      />
                    ) : (
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          isCurrent
                            ? "bg-brand-primary animate-pulse"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      isCurrent
                        ? "text-brand-primary"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {t(`status.${step}`)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Execution Timeline */}
        <section className="flex flex-col gap-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("timeline.title")}
          </h3>

          <div className="flex flex-col gap-0 border-l border-border/40 ml-4">
            {project.updates.map((update, index) => (
              <div key={update.id} className="relative pl-10 pb-12 last:pb-0">
                {/* Timeline Node */}
                <div
                  className={cn(
                    "absolute -left-[9px] top-0 size-4 rounded-full border-2 border-background",
                    update.isMilestone
                      ? "bg-brand-primary scale-125"
                      : "bg-muted-foreground/40",
                    index === 0 && "ring-4 ring-brand-primary/20"
                  )}
                />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                    {update.isMilestone && (
                      <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                        {t("timeline.milestone")}
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                    {update.title}
                  </h4>
                  {update.description && (
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground/60">
                      {update.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
