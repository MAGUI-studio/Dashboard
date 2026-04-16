"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  Calendar,
  CurrencyDollar,
  Trash,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import { deleteProjectAction } from "@/src/lib/actions/project.actions"

interface ProjectDetailsHeaderProps {
  project: {
    id: string
    name: string
    budget: string | null
    deadline: Date | null
  }
}

export function ProjectDetailsHeader({ project }: ProjectDetailsHeaderProps) {
  const t = useTranslations("Admin.projects.details")
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteProjectAction(project.id)
    if (result.success) {
      router.push("/admin/projects")
    } else {
      setIsDeleting(false)
      // Could add a toast here
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="w-max gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft weight="bold" className="size-3" />
          {t("back_button")}
        </Button>

        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-6xl">
            {project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <CurrencyDollar
                weight="duotone"
                className="size-4 text-brand-primary"
              />
              {project.budget || t("no_budget")}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <Calendar
                weight="duotone"
                className="size-4 text-brand-primary"
              />
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : t("no_deadline")}
            </div>
          </div>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-14 rounded-full border-destructive/20 px-8 font-sans font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white"
          >
            <Trash weight="duotone" className="mr-2 size-5" />
            {t("delete_project")}
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
              {t("delete_confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              {t("delete_confirm_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              className="rounded-full font-bold uppercase tracking-widest"
              onClick={() => {}}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              className="rounded-full font-black uppercase tracking-widest"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("confirm_delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
