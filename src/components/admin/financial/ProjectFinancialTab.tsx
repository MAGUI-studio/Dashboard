"use client"

import * as React from "react"

import { Prisma } from "@/src/generated/client"
import {
  Bank,
  CheckCircle,
  Clock,
  DotsThreeVertical,
  FilePdf,
  Receipt,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import { registerPaymentAction } from "@/src/lib/actions/financial.actions"
import { cn } from "@/src/lib/utils/utils"

type InvoiceWithInstallments = Prisma.InvoiceGetPayload<{
  include: {
    installments: {
      include: {
        paymentEvents: true
      }
    }
  }
}>

interface ProjectFinancialTabProps {
  invoices: InvoiceWithInstallments[]
}

export function ProjectFinancialTab({ invoices }: ProjectFinancialTabProps) {
  const [selectedInstallment, setSelectedInstallment] = React.useState<
    InvoiceWithInstallments["installments"][number] | null
  >(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)

  const totalValue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const paidValue = invoices.reduce((acc, inv) => {
    return (
      acc +
      inv.installments
        .filter((i) => i.status === "PAID")
        .reduce((sum, inst) => sum + inst.amount, 0)
    )
  }, 0)

  const handleRegisterPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInstallment) return

    const formData = new FormData(e.currentTarget)
    const result = await registerPaymentAction({
      installmentId: selectedInstallment.id,
      type: formData.get("type") as string,
      amount: selectedInstallment.amount,
      date: new Date(),
      note: formData.get("note") as string,
    })

    if (result.success) {
      toast.success("Pagamento registrado!")
      setIsPaymentDialogOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-border/40 bg-background/40">
          <CardContent className="pt-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Total do Projeto
            </span>
            <p className="text-3xl font-black uppercase tracking-tight mt-1 text-foreground">
              R${" "}
              {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardContent className="pt-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">
              Total Pago
            </span>
            <p className="text-3xl font-black uppercase tracking-tight mt-1 text-emerald-600">
              R${" "}
              {paidValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-amber-500/20 bg-amber-500/[0.02]">
          <CardContent className="pt-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">
              A Receber
            </span>
            <p className="text-3xl font-black uppercase tracking-tight mt-1 text-amber-600">
              R${" "}
              {(totalValue - paidValue).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {invoices.map((invoice) => (
          <Card
            key={invoice.id}
            className="rounded-[2.5rem] border-border/40 bg-background/40 overflow-hidden shadow-sm"
          >
            <CardHeader className="bg-muted/10 border-b border-border/40 py-6 px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Receipt weight="fill" className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                      {invoice.title}
                    </CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                      Emitido em{" "}
                      {format(new Date(invoice.createdAt), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-border/40 bg-background/50 px-4 py-1 text-[9px] font-black uppercase tracking-widest"
                >
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-4">
                {invoice.installments.map((inst) => (
                  <div
                    key={inst.id}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-2xl border transition-all",
                      inst.status === "PAID"
                        ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                        : "border-border/40 bg-muted/5"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full border",
                          inst.status === "PAID"
                            ? "border-emerald-500/40 bg-emerald-500 text-white"
                            : "border-border/60 text-muted-foreground/40"
                        )}
                      >
                        {inst.status === "PAID" ? (
                          <CheckCircle weight="bold" className="size-5" />
                        ) : (
                          <Clock className="size-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Parcela {inst.number}
                        </p>
                        <p className="text-lg font-black uppercase tracking-tight">
                          R${" "}
                          {inst.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Vencimento
                        </p>
                        <p className="text-xs font-bold">
                          {format(new Date(inst.dueDate), "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-10 rounded-full hover:bg-muted/20"
                          >
                            <DotsThreeVertical
                              weight="bold"
                              className="size-5"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-2xl border-border/40 bg-background/95 p-1.5 backdrop-blur-xl shadow-2xl"
                        >
                          {inst.status !== "PAID" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInstallment(inst)
                                setIsPaymentDialogOpen(true)
                              }}
                              className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-600"
                            >
                              <Bank weight="bold" className="mr-2.5 size-4" />
                              <span className="font-bold uppercase text-[10px]">
                                Registrar Pagamento
                              </span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-brand-primary/10 focus:text-brand-primary">
                            <FilePdf weight="bold" className="mr-2.5 size-4" />
                            <span className="font-bold uppercase text-[10px]">
                              Gerar Recibo
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-[450px] border-border/10 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight">
              Registrar Pagamento
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterPayment} className="space-y-6">
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">
                  Valor da Parcela
                </p>
                <p className="text-2xl font-black text-emerald-700">
                  R${" "}
                  {selectedInstallment?.amount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">
                  Método de Pagamento
                </label>
                <select
                  name="type"
                  className="w-full h-12 rounded-full border border-border/40 bg-muted/10 px-6 font-bold text-sm outline-none focus:border-brand-primary"
                >
                  <option value="PIX">PIX</option>
                  <option value="TED">Transferência (TED/DOC)</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">
                  Observações
                </label>
                <textarea
                  name="note"
                  placeholder="Ex: Comprovante enviado via e-mail..."
                  className="w-full min-h-[80px] rounded-2xl border border-border/40 bg-muted/10 p-6 font-bold text-sm outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-full bg-emerald-600 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-700"
            >
              Confirmar Pagamento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
