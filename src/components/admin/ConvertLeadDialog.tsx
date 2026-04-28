"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { ProjectCategory } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import { CheckCircle, CircleNotch, RocketLaunch } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { convertLeadToProjectAction } from "@/src/lib/actions/crm.actions"

interface ConvertLeadDialogProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Array<{ id: string; name: string | null; email: string }>
  onConverted?: (projectId: string) => void
}

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  clients,
  onConverted,
}: ConvertLeadDialogProps): React.JSX.Element {
  const t = useTranslations("Admin.crm.convert")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [clientMode, setClientMode] = React.useState<"existing" | "create">(
    "existing"
  )
  const [selectedClientId, setSelectedClientId] = React.useState<string>("")
  const [projectName, setProjectName] = React.useState(lead.companyName)
  const [category, setCategory] = React.useState<ProjectCategory>(
    ProjectCategory.LANDING_PAGE
  )
  const [budget, setBudget] = React.useState(lead.value || "")
  const [deadline] = React.useState("")

  const handleConvert = async () => {
    if (clientMode === "existing" && !selectedClientId) {
      toast.error(t("select_client_error"))
      return
    }

    if (clientMode === "create" && !lead.email) {
      toast.error(t("email_required_error"))
      return
    }

    setIsSubmitting(true)
    const result = await convertLeadToProjectAction({
      leadId: lead.id,
      userId: clientMode === "existing" ? selectedClientId : undefined,
      newUserData:
        clientMode === "create"
          ? {
              email: lead.email ?? "",
              name: lead.contactName || lead.companyName,
            }
          : undefined,
      projectData: {
        name: projectName,
        category,
        budget,
        deadline: deadline || undefined,
        paymentMethod: "FIFTY_FIFTY",
      },
    })

    if (result.success) {
      toast.success(t("success"))
      onOpenChange(false)
      if (result.projectId) {
        onConverted?.(result.projectId)
      }
      router.push(`/admin/projects/${result.projectId}`)
    } else {
      toast.error(result.error || t("error"))
    }
    setIsSubmitting(false)
  }

  const categories = Object.values(ProjectCategory)
  const catT = useTranslations("Admin.projects.form.categories")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="bg-brand-primary/10 p-10 pb-6">
          <DialogHeader className="gap-5">
            <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
              <RocketLaunch weight="bold" className="size-8" />
            </div>
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight text-brand-primary leading-none">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-xs font-black text-brand-primary/60 uppercase tracking-[0.2em]">
                {t("description")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="p-10 pt-8 space-y-8">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("client_section")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={clientMode === "existing" ? "default" : "outline"}
                  className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setClientMode("existing")}
                >
                  {t("existing_client")}
                </Button>
                <Button
                  type="button"
                  variant={clientMode === "create" ? "default" : "outline"}
                  className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setClientMode("create")}
                >
                  {t("create_client")}
                </Button>
              </div>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
                disabled={clientMode !== "existing"}
              >
                <SelectTrigger className="h-14 rounded-2xl border-border/40 bg-muted/10">
                  <SelectValue placeholder={t("select_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name || client.email} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[9px] font-medium text-muted-foreground/40 italic">
                {clientMode === "create"
                  ? t("create_hint", {
                      email: lead.email ?? t("missing_email"),
                    })
                  : t("existing_hint")}
              </p>
            </div>

            <div className="h-px bg-border/10" />

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("project_section")}
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-tight ml-1">
                    {t("project_name")}
                  </Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-tight ml-1">
                    {t("category")}
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as ProjectCategory)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {catT(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-tight ml-1">
                    {t("budget")}
                  </Label>
                  <Input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={t("budget_placeholder")}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Button
              variant="ghost"
              className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              className="h-16 rounded-[1.25rem] bg-brand-primary font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 hover:brightness-110"
              onClick={handleConvert}
              disabled={
                isSubmitting ||
                !projectName ||
                (clientMode === "existing" && !selectedClientId) ||
                (clientMode === "create" && !lead.email)
              }
            >
              {isSubmitting ? (
                <CircleNotch className="mr-2 size-5 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 size-5" weight="bold" />
              )}
              {t("submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
