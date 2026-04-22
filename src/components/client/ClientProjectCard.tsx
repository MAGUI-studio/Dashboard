import * as React from "react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/src/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { FolderOpen, Calendar, ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import { ClientProjectSummary } from "@/src/types/client-portal"

interface ClientProjectCardProps {
  project: ClientProjectSummary
}

export async function ClientProjectCard({ project }: ClientProjectCardProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home.project")

  return (
    <Link href={{ pathname: "/projects/[id]", params: { id: project.id } }}>
      <Card className="group relative overflow-hidden rounded-[2.5rem] border-border/40 bg-muted/10 p-8 transition-all hover:bg-muted/15 lg:p-10">
        <div className="absolute top-8 right-8 flex size-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-brand-primary group-hover:text-white lg:top-10 lg:right-10">
          <ArrowUpRight weight="bold" className="size-5" />
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <FolderOpen weight="duotone" className="size-5 text-brand-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/50">
                {t("active_project")}
              </span>
            </div>
            <h3 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {project.name}
            </h3>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                {t("phase")}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-primary">
                  {project.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                {t("progress")}
              </p>
              <div className="flex flex-col gap-2">
                <span className="font-heading text-xl font-black text-foreground">
                  {project.progress}%
                </span>
                <Progress value={project.progress} className="h-1.5 w-full max-w-[120px]" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                {t("deadline")}
              </p>
              <div className="flex items-center gap-2.5">
                <Calendar weight="duotone" className="size-5 text-muted-foreground/40" />
                <span className="font-heading text-xl font-black text-foreground">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString("pt-BR") : t("no_deadline")}
                </span>
              </div>
            </div>
          </div>

          {project.lastUpdate && (
            <div className="mt-4 flex items-center gap-3 border-t border-border/15 pt-8">
              <div className="size-2 shrink-0 rounded-full bg-brand-primary/40" />
              <p className="text-sm font-medium text-muted-foreground/75">
                {t("last_update")}: <span className="text-foreground">{project.lastUpdate.title}</span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
