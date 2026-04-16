"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Trash, Warning } from "@phosphor-icons/react"

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
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import { deleteProjectAction } from "@/src/lib/actions/project.actions"

interface DangerZoneProps {
  projectId: string
  projectName: string
}

export function DangerZone({ projectId, projectName }: DangerZoneProps) {
  const t = useTranslations("Admin.projects.details")
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [confirmName, setConfirmName] = React.useState("")
  const [error, setError] = React.useState(false)

  const handleDelete = async () => {
    if (confirmName !== projectName) {
      setError(true)
      return
    }

    setIsDeleting(true)
    const result = await deleteProjectAction(projectId)
    if (result.success) {
      router.push("/admin/projects")
    } else {
      setIsDeleting(false)
    }
  }

  return (
    <section className="mt-12 rounded-3xl border border-destructive/20 bg-destructive/5 p-8 backdrop-blur-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-destructive">
            <Warning weight="fill" className="size-4" />
            {t("danger_zone_title")}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t("danger_zone_desc")}
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-12 rounded-full border-destructive/20 px-8 font-sans font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white"
            >
              <Trash weight="duotone" className="mr-2 size-5" />
              {t("delete_project")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-black uppercase tracking-tight text-destructive">
                {t("delete_confirm_title")}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                {t("delete_confirm_desc")}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("delete_confirm_input_label")}
                </Label>
                <div className="rounded-xl bg-muted/20 p-3 text-center">
                  <span className="font-mono font-bold text-foreground">
                    {projectName}
                  </span>
                </div>
                <Input
                  value={confirmName}
                  onChange={(e) => {
                    setConfirmName(e.target.value)
                    setError(false)
                  }}
                  placeholder={t("delete_confirm_placeholder")}
                  className="h-12 rounded-xl border-border/40 bg-muted/10 font-bold"
                />
                {error && (
                  <p className="text-[10px] font-bold text-destructive uppercase">
                    {t("delete_confirm_error")}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3">
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
                disabled={isDeleting || confirmName !== projectName}
              >
                {isDeleting ? t("deleting") : t("confirm_delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
