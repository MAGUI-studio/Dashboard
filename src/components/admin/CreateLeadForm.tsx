"use client"

import { useState } from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  Building,
  CalendarDots,
  CircleNotch,
  CurrencyDollar,
  Envelope,
  Funnel,
  Globe,
  InstagramLogo,
  Note,
  Phone,
  Plus,
  User,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import { Textarea } from "@/src/components/ui/textarea"

import { createLead } from "@/src/lib/actions/crm.actions"

export function CreateLeadForm(): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      companyName: formData.get("companyName") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      website: formData.get("website") as string,
      instagram: formData.get("instagram") as string,
      notes: formData.get("notes") as string,
      value: formData.get("value") as string,
      source: ((formData.get("source") as string) || "OTHER") as
        | "REFERRAL"
        | "ORGANIC"
        | "INSTAGRAM"
        | "LINKEDIN"
        | "WEBSITE"
        | "OUTBOUND"
        | "EVENT"
        | "OTHER",
      nextActionAt: formData.get("nextActionAt") as string,
    }

    const result = await createLead(data)

    if (result.success) {
      toast.success(t("form.success"))
      setOpen(false)
      router.refresh()
    } else {
      toast.error(t("form.error"))
    }

    setIsLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-full shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2" size={18} weight="bold" />
          {t("create")}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[94vw] border-l border-border/30 bg-background/95 p-0 sm:min-w-[38rem] sm:max-w-[40vw]"
      >
        <SheetHeader className="border-b border-border/20 bg-gradient-to-b from-brand-primary/6 to-transparent px-8 py-8 text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
              Protocolo de Prospecção
            </span>
          </div>
          <SheetTitle className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
            {t("create")}
          </SheetTitle>
          <SheetDescription className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/60 text-left">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 pb-32">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-l-2 border-brand-primary pl-3">
                Identificação da Empresa
              </h3>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.company")}{" "}
                    <span className="text-brand-primary">*</span>
                  </Label>
                  <div className="relative group">
                    <Building
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="companyName"
                      name="companyName"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10 focus:ring-brand-primary/20"
                      required
                      placeholder="Ex: Nome da Empresa Ltda"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactName"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.contact")}
                  </Label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="contactName"
                      name="contactName"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                      placeholder="Nome do decisor"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-l-2 border-brand-primary pl-3">
                Canais de Contato
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.email")}
                  </Label>
                  <div className="relative group">
                    <Envelope
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.phone")}
                  </Label>
                  <div className="relative group">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="phone"
                      name="phone"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-l-2 border-brand-primary pl-3">
                Origem e próxima ação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Origem
                  </Label>
                  <div className="relative">
                    <Funnel
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/40"
                      size={18}
                    />
                    <Select name="source" defaultValue="OTHER">
                      <SelectTrigger className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5">
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REFERRAL">Indicação</SelectItem>
                        <SelectItem value="ORGANIC">Orgânico</SelectItem>
                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                        <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                        <SelectItem value="WEBSITE">Site</SelectItem>
                        <SelectItem value="OUTBOUND">Outbound</SelectItem>
                        <SelectItem value="EVENT">Evento</SelectItem>
                        <SelectItem value="OTHER">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="nextActionAt"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Próxima ação
                  </Label>
                  <div className="relative group">
                    <CalendarDots
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="nextActionAt"
                      name="nextActionAt"
                      type="datetime-local"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-l-2 border-brand-primary pl-3">
                Presença Digital e Valor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="website"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.website")}
                  </Label>
                  <div className="relative group">
                    <Globe
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="instagram"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.instagram")}
                  </Label>
                  <div className="relative group">
                    <InstagramLogo
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="instagram"
                      name="instagram"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                      placeholder="@usuario"
                    />
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label
                    htmlFor="value"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {t("form.value")}
                  </Label>
                  <div className="relative group">
                    <CurrencyDollar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                      size={18}
                    />
                    <Input
                      id="value"
                      name="value"
                      className="pl-12 h-12 rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                      placeholder="R$ 0.000,00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label
                htmlFor="notes"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {t("form.notes")}
              </Label>
              <div className="relative group">
                <Note
                  className="absolute left-4 top-4 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors"
                  size={18}
                />
                <Textarea
                  id="notes"
                  name="notes"
                  className="pl-12 min-h-[120px] rounded-xl border-border/40 bg-muted/5 transition-all focus:bg-muted/10"
                  placeholder="Detalhes estratégicos coletados durante a prospecção..."
                />
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 right-0 left-0 p-8 border-t border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-end gap-4 z-20">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="rounded-full px-6 font-bold uppercase tracking-widest text-[10px]"
            >
              {t("details.cancel")}
            </Button>
            <Button
              type="submit"
              className="rounded-full px-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <CircleNotch
                  className="mr-2 animate-spin"
                  size={18}
                  weight="bold"
                />
              ) : null}
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
