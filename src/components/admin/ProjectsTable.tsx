"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import { MagnifyingGlass, ProjectorScreen } from "@phosphor-icons/react"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

export interface ProjectData {
  id: string
  name: string
  status: string
  progress: number
  client: {
    name: string | null
    email: string
  }
  createdAt: string
}

interface ProjectsTableProps {
  initialProjects: ProjectData[]
}

export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const t = useTranslations("Dashboard.status")
  const commonT = useTranslations("Admin.clients.table")
  const [search, setSearch] = React.useState("")

  const filteredProjects = React.useMemo(() => {
    if (!search) return initialProjects
    const query = search.toLowerCase()
    return initialProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.client.name?.toLowerCase() || "").includes(query) ||
        p.client.email.toLowerCase().includes(query)
    )
  }, [initialProjects, search])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex-1 group">
        <MagnifyingGlass
          weight="duotone"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar projetos..."
          className="h-14 rounded-2xl border-border/40 bg-muted/20 pl-12 pr-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/30"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/40 bg-muted/10 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Projeto
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Cliente
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status / Progresso
              </TableHead>
              <TableHead className="px-8 h-16 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {commonT("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
                >
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="group border-border/20 transition-all hover:bg-brand-primary/[0.03]"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                        <ProjectorScreen weight="duotone" className="size-6" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {project.name}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          Criado em{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground uppercase">
                        {project.client.name || "Sem nome"}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {project.client.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-brand-primary/5 text-brand-primary border-brand-primary/20 text-[8px] font-black uppercase tracking-widest py-0.5 px-2"
                        >
                          {t(project.status)}
                        </Badge>
                        <span className="text-[10px] font-black text-brand-primary/60">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full bg-brand-primary transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-full px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
                    >
                      <Link
                        href={{
                          pathname: "/admin/projects/[id]",
                          params: { id: project.id },
                        }}
                      >
                        {commonT("inspect")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
