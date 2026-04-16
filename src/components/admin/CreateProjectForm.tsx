"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  ArrowRight,
  Calendar as CalendarIcon,
  CaretUpDown,
  Check,
  CurrencyDollar,
  FileText,
  FolderPlus,
  ShieldCheck,
  User,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/src/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import { Textarea } from "@/src/components/ui/textarea"

import { createProjectAction } from "@/src/lib/actions/project.actions"
import { cn, formatCurrencyBRL } from "@/src/lib/utils/utils"

interface ClientSelection {
  id: string
  name: string | null
  email: string
}

interface CreateProjectFormProps {
  clients: ClientSelection[]
}

export function CreateProjectForm({ clients }: CreateProjectFormProps) {
  const t = useTranslations("Admin.projects.form")
  const router = useRouter()

  const [selectedClientId, setSelectedClientId] = React.useState<string>("")
  const [openClients, setOpenClients] = React.useState(false)

  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [budgetValue, setBudgetValue] = React.useState("")

  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: unknown, formData: FormData) => {
      formData.set("clientId", selectedClientId)
      if (date) {
        formData.set("deadline", date.toISOString())
      }

      const result = await createProjectAction(formData)
      if (result.success) {
        router.push("/admin/projects")
        return { success: true, error: null }
      }
      return { success: false, error: result.error }
    },
    { success: false, error: null }
  )

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBudgetValue(formatCurrencyBRL(value))
  }

  return (
    <form action={formAction} className="mx-auto w-full">
      <FieldGroup className="gap-12">
        {/* Section: Client Protocol */}
        <FieldSet>
          <div className="mb-6 flex flex-col gap-1">
            <FieldLegend className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
              {t("client_info")}
            </FieldLegend>
            <FieldDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              {t("client_protocol")}
            </FieldDescription>
          </div>

          <Field data-invalid={state.error && !selectedClientId}>
            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Cliente Responsável
            </FieldLabel>

            <input type="hidden" name="clientId" value={selectedClientId} />

            <Popover open={openClients} onOpenChange={setOpenClients}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClients}
                  className="h-14 w-full justify-between rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold text-foreground transition-all hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <User
                      weight="bold"
                      className="size-4 text-brand-primary/60"
                    />
                    {selectedClientId
                      ? clients.find((client) => client.id === selectedClientId)
                          ?.name ||
                        clients.find((client) => client.id === selectedClientId)
                          ?.email
                      : t("select_client_placeholder")}
                  </div>
                  <CaretUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                <Command className="rounded-2xl">
                  <CommandInput
                    placeholder={t("search_client_placeholder")}
                    className="h-12 border-none bg-transparent"
                  />
                  <CommandList className="max-h-64 scrollbar-hide">
                    <CommandEmpty className="py-6 text-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {t("empty_clients")}
                    </CommandEmpty>
                    <CommandGroup className="p-2">
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.email}
                          onSelect={() => {
                            setSelectedClientId(client.id)
                            setOpenClients(false)
                          }}
                          className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 aria-selected:bg-brand-primary/10"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex size-8 items-center justify-center rounded-lg border border-border/40 bg-background/50 text-[10px] font-black uppercase transition-colors",
                                selectedClientId === client.id
                                  ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary"
                                  : "text-muted-foreground/60"
                              )}
                            >
                              {client.name ? client.name.substring(0, 2) : "??"}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                                {client.name || t("hidden_identity")}
                              </span>
                              <span className="text-[9px] font-medium text-muted-foreground/50">
                                {client.email}
                              </span>
                            </div>
                          </div>
                          {selectedClientId === client.id && (
                            <Check
                              weight="bold"
                              className="size-3 text-brand-primary"
                            />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FieldDescription className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {t("client_selection_desc")}
            </FieldDescription>
          </Field>
        </FieldSet>

        {/* Section: Project Engineering */}
        <FieldSet>
          <div className="mb-6 flex flex-col gap-1">
            <FieldLegend className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
              {t("project_info")}
            </FieldLegend>
            <FieldDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              {t("project_engineering")}
            </FieldDescription>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("projectName")}
              </FieldLabel>
              <InputGroup className="h-14 rounded-2xl border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <FolderPlus
                    weight="bold"
                    className="size-4 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="projectName"
                  placeholder="Ex: Landing Page MAGUI"
                  required
                  disabled={isPending}
                  className="font-sans font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/30"
                />
              </InputGroup>
              <FieldDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {t("project_name_desc")}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("budget")}
              </FieldLabel>
              <InputGroup className="h-14 rounded-2xl border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <CurrencyDollar
                    weight="bold"
                    className="size-4 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="budget"
                  value={budgetValue}
                  onChange={handleBudgetChange}
                  placeholder="R$ 0,00"
                  disabled={isPending}
                  className="font-sans font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/30"
                />
              </InputGroup>
              <FieldDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {t("budget_desc")}
              </FieldDescription>
            </Field>
          </div>

          <Field className="mt-4">
            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("projectDescription")}
            </FieldLabel>
            <InputGroup className="min-h-[140px] items-start rounded-2xl border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
              <InputGroupAddon className="pt-4">
                <FileText
                  weight="bold"
                  className="size-4 text-brand-primary/60"
                />
              </InputGroupAddon>
              <Textarea
                name="projectDescription"
                placeholder={t("project_description_placeholder")}
                disabled={isPending}
                className="flex-1 border-none bg-transparent pt-4 font-sans font-bold text-foreground shadow-none ring-0 focus-visible:ring-0 placeholder:font-medium placeholder:text-muted-foreground/30"
              />
            </InputGroup>
          </Field>

          <Field className="mt-4">
            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("deadline")}
            </FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-14 justify-start text-left font-sans font-bold rounded-2xl border-border/40 bg-muted/10 px-4 transition-all hover:bg-muted/20",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon
                    className="mr-3 size-4 text-brand-primary/60"
                    weight="bold"
                  />
                  {date ? (
                    format(date, "PPP", { locale: ptBR })
                  ) : (
                    <span className="font-medium opacity-30">
                      {t("deadline_placeholder")}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                  className="rounded-2xl"
                />
              </PopoverContent>
            </Popover>
          </Field>
        </FieldSet>

        {/* Submission Terminal */}
        <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
          {state.error && (
            <div className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck weight="bold" className="size-5 text-destructive" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">
                {state.error}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col gap-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
                {t("confirmation_title")}
              </h4>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {t("confirmation_desc")}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || !selectedClientId}
              className="group relative h-16 w-full overflow-hidden rounded-full border border-brand-primary/20 bg-brand-primary font-sans font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-brand-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 md:w-max md:px-12"
            >
              <div className="relative z-10 flex items-center gap-3">
                {isPending ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("submit")}</span>
                    <ArrowRight
                      weight="bold"
                      className="size-5 transition-transform group-hover:translate-x-2"
                      data-icon="inline-end"
                    />
                  </>
                )}
              </div>
              <div className="absolute inset-0 z-0 bg-linear-to-tr from-brand-primary via-brand-primary to-brand-luminous opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  )
}
