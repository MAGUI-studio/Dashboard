"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import { Plus, Receipt } from "@phosphor-icons/react"
import { addMonths } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import { createInvoiceAction } from "@/src/lib/actions/financial.actions"
import { parseCurrencyBRLToCents } from "@/src/lib/utils/utils"

interface AddInvoiceFormProps {
  projectId: string
}

export function AddInvoiceForm({ projectId }: AddInvoiceFormProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const totalAmountCents = parseCurrencyBRLToCents(
      String(formData.get("totalAmount") || "")
    )
    const installmentsCount = parseInt(formData.get("installments") as string)
    const firstDueDateStr = formData.get("firstDueDate") as string
    const firstDueDate = new Date(firstDueDateStr + "T12:00:00") // Use midday to avoid TZ issues

    if (isNaN(totalAmountCents) || totalAmountCents <= 0) {
      toast.error("Valor total inválido")
      setIsLoading(false)
      return
    }

    const installments = []
    const amountPerInstallment = Math.floor(
      totalAmountCents / installmentsCount
    )
    const remainder =
      totalAmountCents - amountPerInstallment * installmentsCount

    for (let i = 1; i <= installmentsCount; i++) {
      installments.push({
        number: i,
        amount:
          amountPerInstallment + (i === installmentsCount ? remainder : 0),
        dueDate: addMonths(firstDueDate, i - 1),
      })
    }

    // amounts are integers in cents; remainder is added to last installment above

    const result = await createInvoiceAction({
      title,
      description: description || undefined,
      projectId,
      totalAmount: totalAmountCents,
      currency: "BRL",
      installments,
    })

    if (result.success) {
      toast.success("Fatura criada com sucesso")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Erro ao criar fatura")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 rounded-full bg-brand-primary px-8 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105">
          <Plus weight="bold" className="mr-2 size-4" />
          Nova Fatura
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-border/10 bg-background/95 backdrop-blur-xl sm:max-w-[500px]">
        <DialogHeader className="mb-6">
          <DialogTitle className="flex items-center gap-3 font-heading text-2xl font-black uppercase tracking-tight text-foreground">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Receipt weight="fill" className="size-5" />
            </div>
            Criar Nova Fatura
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Título da Fatura
              </Label>
              <Input
                name="title"
                placeholder="Ex: Desenvolvimento Web - Fase 1"
                required
                className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Valor Total (R$)
                </Label>
                <Input
                  name="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  required
                  className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Parcelas
                </Label>
                <Input
                  name="installments"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue="1"
                  required
                  className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Data do Primeiro Vencimento
              </Label>
              <Input
                name="firstDueDate"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="h-12 rounded-full border-border/40 bg-muted/10 px-6 font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Observações
              </Label>
              <Textarea
                name="description"
                placeholder="Detalhes adicionais sobre o pagamento..."
                className="min-h-[100px] rounded-3xl border-border/40 bg-muted/10 p-6 font-bold"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 w-full rounded-full bg-brand-primary text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:bg-brand-primary/90"
          >
            {isLoading ? "Criando..." : "Confirmar e Gerar Fatura"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
