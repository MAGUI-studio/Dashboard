"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import { ProjectCategory } from "@/src/generated/client/enums"
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
}

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  clients,
}: ConvertLeadDialogProps): React.JSX.Element {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedClientId, setSelectedClientId] = React.useState<string>("")
  const [projectName, setProjectName] = React.useState(lead.companyName)
  const [category, setCategory] = React.useState<ProjectCategory>(
    ProjectCategory.WEB_APP
  )
  const [budget, setBudget] = React.useState(lead.value || "")
  const [deadline] = React.useState("")

  const handleConvert = async () => {
    if (!selectedClientId) {
      toast.error("Selecione um cliente.")
      return
    }

    setIsSubmitting(true)
    const result = await convertLeadToProjectAction({
      leadId: lead.id,
      userId: selectedClientId,
      projectData: {
        name: projectName,
        category,
        budget,
        deadline: deadline || undefined,
      },
    })

    if (result.success) {
      toast.success("Lead convertido com sucesso!")
      onOpenChange(false)
      router.push(`/admin/projects/${result.projectId}`)
    } else {
      toast.error(result.error || "Erro ao converter lead.")
    }
    setIsSubmitting(false)
  }

  const categories = Object.values(ProjectCategory)

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
                Converter em Projeto
              </DialogTitle>
              <DialogDescription className="text-xs font-black text-brand-primary/60 uppercase tracking-[0.2em]">
                Transicao para execucao
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="p-10 pt-8 space-y-8">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                1. Selecionar Cliente Existente
              </Label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger className="h-14 rounded-2xl border-border/40 bg-muted/10">
                  <SelectValue placeholder="Escolha o acesso do cliente..." />
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
                Nota: A criacao de novos acessos deve ser feita via menu
                Clientes por seguranca.
              </p>
            </div>

            <div className="h-px bg-border/10" />

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                2. Dados do Projeto
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-tight ml-1">
                    Nome do Projeto
                  </Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-tight ml-1">
                    Categoria
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
                          {c.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-tight ml-1">
                    Orcamento (Opcional)
                  </Label>
                  <Input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ex: R$ 15.000"
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
              Cancelar
            </Button>
            <Button
              className="h-16 rounded-[1.25rem] bg-brand-primary font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 hover:brightness-110"
              onClick={handleConvert}
              disabled={isSubmitting || !selectedClientId || !projectName}
            >
              {isSubmitting ? (
                <CircleNotch className="mr-2 size-5 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 size-5" weight="bold" />
              )}
              Iniciar Projeto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
