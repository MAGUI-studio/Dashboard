"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { LeadSource, LeadStatus } from "@/src/generated/client/enums"
import { Link } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  ArrowSquareOut,
  CaretDown,
  ChatCircleText,
  CircleNotch,
  Clock,
  DeviceMobile,
  EnvelopeSimple,
  Globe,
  InstagramLogo,
  LinkSimple,
  PencilSimple,
  Phone,
  Plus,
  RocketLaunch,
  Trash,
  Warning,
  WhatsappLogo,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import { Textarea } from "@/src/components/ui/textarea"

import { ConvertLeadDialog } from "@/src/components/admin/ConvertLeadDialog"
import { LeadActivityFeed } from "@/src/components/admin/LeadActivityFeed"
import { LeadStatusBadge } from "@/src/components/admin/LeadStatusBadge"

import {
  addLeadNote,
  deleteLead,
  saveMessageTemplateAction,
  updateLead,
  updateLeadStatus,
} from "@/src/lib/actions/crm.actions"
import { sanitizePhoneForWhatsApp } from "@/src/lib/utils/crm"

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

type LeadSourceValue =
  | "REFERRAL"
  | "ORGANIC"
  | "INSTAGRAM"
  | "LINKEDIN"
  | "WEBSITE"
  | "OTHER"

function getInitialFormState(lead: Lead) {
  return {
    companyName: lead.companyName,
    contactName: lead.contactName ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    website: lead.website ?? "",
    instagram: lead.instagram ?? "",
    notes: lead.notes ?? "",
    source: lead.source as LeadSourceValue,
    nextActionAt: lead.nextActionAt
      ? new Date(lead.nextActionAt).toISOString().split("T")[0]
      : "",
  }
}

export function LeadDetailsDrawer({
  lead,
  children,
  onOpenChange,
  open: controlledOpen,
  clients,
  templates,
}: {
  lead: Lead
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
  open?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
}): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const router = useRouter()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [note, setNote] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSavingNote, setIsSavingNote] = React.useState(false)
  const [isSavingLead, setIsSavingLead] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] =
    React.useState<LeadStatus | null>(null)
  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false)
  const [confirmValue, setConfirmValue] = React.useState("")
  const [deleteError, setDeleteError] = React.useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = React.useState(false)

  const [customMessage, setCustomMessage] = React.useState("")
  const [isSavingTemplate, setIsSavingLeadTemplate] = React.useState(false)

  const [form, setForm] = React.useState(() => getInitialFormState(lead))
  const open = controlledOpen ?? uncontrolledOpen

  React.useEffect(() => {
    setForm(getInitialFormState(lead))
  }, [lead])

  const confirmCode = lead.id.slice(-6).toUpperCase()

  const personalizeMessage = React.useCallback(
    (content: string) => {
      return content
        .replace(/{contact}/g, lead.contactName || "time")
        .replace(/{company}/g, lead.companyName)
    },
    [lead.contactName, lead.companyName]
  )

  const handleUseTemplate = (content: string) => {
    setCustomMessage(personalizeMessage(content))
  }

  const handleSaveAsTemplate = async () => {
    if (!customMessage) return

    setIsSavingLeadTemplate(true)
    const name = `Template ${new Date().toLocaleDateString()}`
    const result = await saveMessageTemplateAction({
      name,
      content: customMessage
        .replace(lead.companyName, "{company}")
        .replace(lead.contactName || "time", "{contact}"),
      scope: "LEAD",
    })

    if (result.success) {
      toast.success("Template salvo para uso futuro.")
    }
    setIsSavingLeadTemplate(false)
  }

  const visibleInfoItems = React.useMemo(
    () =>
      [
        lead.contactName
          ? {
              label: "Contato",
              value: lead.contactName,
              icon: (
                <ChatCircleText
                  size={16}
                  className="text-muted-foreground/55"
                />
              ),
            }
          : null,
        lead.phone
          ? {
              label: "Telefone",
              value: lead.phone,
              icon: <Phone size={16} className="text-muted-foreground/55" />,
            }
          : null,
        lead.email
          ? {
              label: "E-mail",
              value: lead.email,
              icon: (
                <EnvelopeSimple
                  size={16}
                  className="text-muted-foreground/55"
                />
              ),
            }
          : null,
        {
          label: "Origem",
          value: t(`source.${lead.source}`),
          icon: <LinkSimple size={16} className="text-muted-foreground/55" />,
        },
        lead.source === LeadSource.INSTAGRAM && lead.instagram
          ? {
              label: "Instagram",
              value: lead.instagram,
              icon: (
                <InstagramLogo size={16} className="text-muted-foreground/55" />
              ),
            }
          : null,
        lead.website
          ? {
              label:
                lead.source === LeadSource.LINKEDIN
                  ? "LinkedIn"
                  : lead.source === LeadSource.WEBSITE
                    ? "Site"
                    : "Link",
              value: lead.website,
              icon: <Globe size={16} className="text-muted-foreground/55" />,
            }
          : null,
      ].filter(Boolean),
    [lead, t]
  ) as Array<{ label: string; value: string; icon: React.ReactNode }>

  const showInstagramField = form.source === "INSTAGRAM"
  const showWebsiteField =
    form.source === "WEBSITE" || form.source === "LINKEDIN"

  const sourceFieldLabel = showInstagramField
    ? "Link do Instagram"
    : form.source === "LINKEDIN"
      ? "Link do LinkedIn"
      : "Site"

  const sourceFieldPlaceholder = showInstagramField
    ? "https://instagram.com/usuario"
    : form.source === "LINKEDIN"
      ? "https://linkedin.com/in/usuario"
      : "https://"

  const handleSheetOpenChange = (nextOpen: boolean): void => {
    setUncontrolledOpen(nextOpen)
    onOpenChange?.(nextOpen)

    if (!nextOpen) {
      setIsEditing(false)
      setQuickActionsOpen(false)
      setConfirmValue("")
      setDeleteError(false)
      setNote("")
      setCustomMessage("")
      setForm(getInitialFormState(lead))
    }
  }

  const handleStatusChange = async (status: LeadStatus): Promise<void> => {
    setIsUpdatingStatus(status)
    const result = await updateLeadStatus(lead.id, status)

    if (result.success) {
      toast.success("Status atualizado.")
      router.refresh()
    } else {
      toast.error(t("form.error"))
    }

    setIsUpdatingStatus(null)
  }

  const handleAddNote = async (): Promise<void> => {
    setIsSavingNote(true)
    const result = await addLeadNote({
      leadId: lead.id,
      content: note,
    })

    if (result.success) {
      toast.success("Nota registrada.")
      setNote("")
      router.refresh()
    } else {
      toast.error("Nao foi possivel salvar a nota.")
    }

    setIsSavingNote(false)
  }

  const handleSaveLead = async (): Promise<void> => {
    setIsSavingLead(true)

    const result = await updateLead({
      id: lead.id,
      companyName: form.companyName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      website: showWebsiteField ? form.website : "",
      instagram: showInstagramField ? form.instagram : "",
      notes: form.notes,
      value: "",
      source: form.source,
      nextActionAt: form.nextActionAt || undefined,
    })

    if (result.success) {
      toast.success("Lead atualizado.")
      setIsEditing(false)
      router.refresh()
    } else {
      toast.error("Nao foi possivel salvar as alteracoes.")
    }

    setIsSavingLead(false)
  }

  const handleDelete = async (): Promise<void> => {
    if (confirmValue.toUpperCase() !== confirmCode) {
      setDeleteError(true)
      return
    }

    setIsDeleting(true)
    const result = await deleteLead(lead.id)

    if (result.success) {
      toast.success("Lead removido.")
      setUncontrolledOpen(false)
      onOpenChange?.(false)
      router.refresh()
    } else {
      toast.error("Nao foi possivel remover o lead.")
      setIsDeleting(false)
    }
  }

  const statuses = [
    LeadStatus.GARIMPAGEM,
    LeadStatus.CONTATO_REALIZADO,
    LeadStatus.NEGOCIACAO,
    LeadStatus.CONVERTIDO,
  ]

  const phone = sanitizePhoneForWhatsApp(lead.phone)
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`
    : null

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        onPointerDownCapture={(event) => event.stopPropagation()}
        onMouseDownCapture={(event) => event.stopPropagation()}
        className="w-[96vw] overflow-y-auto border-l border-border/30 bg-background/98 p-0 sm:min-w-[40rem] sm:max-w-[42rem]"
      >
        <SheetHeader className="border-b border-border/15 px-8 py-8 text-left">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <SheetTitle className="font-heading text-3xl font-black tracking-tight text-foreground">
                    {lead.companyName}
                  </SheetTitle>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <SheetDescription className="text-sm leading-relaxed text-muted-foreground/65">
                  {t(`source.${lead.source}`)} • {lead.activities?.length || 0}{" "}
                  atividades
                </SheetDescription>
              </div>

              <div className="flex flex-col items-end gap-3">
                <p className="pt-1 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                  Atualizado em {formatDateTime(lead.updatedAt)}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing((current) => !current)
                      setForm(getInitialFormState(lead))
                    }}
                    className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
                  >
                    <PencilSimple className="mr-2 size-4" />
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>

                  {lead.status !== LeadStatus.CONVERTIDO && (
                    <Button
                      onClick={() => setIsConvertDialogOpen(true)}
                      className="rounded-full px-5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.18em]"
                    >
                      <RocketLaunch className="mr-2 size-4" />
                      Converter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {lead.convertedProjectId && (
              <div className="flex items-center gap-2 rounded-2xl bg-green-500/10 p-4 border border-green-500/20">
                <RocketLaunch weight="fill" className="size-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-600">
                    Lead convertido com sucesso
                  </p>
                  <p className="text-xs font-medium text-green-700/80">
                    Este lead agora e um projeto oficial.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 hover:bg-green-500/20"
                >
                  <Link
                    href={{
                      pathname: "/admin/projects/[id]",
                      params: { id: lead.convertedProjectId },
                    }}
                  >
                    Abrir Projeto
                    <ArrowSquareOut className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )}

            {lead.contactName ? (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/75">
                <span>{lead.contactName}</span>
                <span className="text-muted-foreground/35">•</span>
                <span>Criado em {formatDateTime(lead.createdAt)}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground/75">
                Criado em {formatDateTime(lead.createdAt)}
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="grid gap-8 px-8 py-8">
          {isEditing ? (
            <section className="grid gap-5 border-b border-border/15 pb-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                    Empresa
                  </Label>
                  <Input
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        companyName: event.target.value,
                      }))
                    }
                    className="h-12 rounded-[1rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                    Contato
                  </Label>
                  <Input
                    value={form.contactName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contactName: event.target.value,
                      }))
                    }
                    className="h-12 rounded-[1rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                    Telefone
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className="h-12 rounded-[1rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                    E-mail
                  </Label>
                  <Input
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="h-12 rounded-[1rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                    Lembrar de retomar em
                  </Label>
                  <Input
                    type="date"
                    value={form.nextActionAt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nextActionAt: event.target.value,
                      }))
                    }
                    className="h-12 rounded-[1rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                    Origem
                  </Label>
                  <Select
                    value={form.source}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        source: value as LeadSourceValue,
                        website:
                          value === "WEBSITE" || value === "LINKEDIN"
                            ? current.website
                            : "",
                        instagram:
                          value === "INSTAGRAM" ? current.instagram : "",
                      }))
                    }
                  >
                    <SelectTrigger size="lg" className="w-full rounded-[1rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REFERRAL">
                        {t("source.REFERRAL")}
                      </SelectItem>
                      <SelectItem value="ORGANIC">
                        {t("source.ORGANIC")}
                      </SelectItem>
                      <SelectItem value="INSTAGRAM">
                        {t("source.INSTAGRAM")}
                      </SelectItem>
                      <SelectItem value="LINKEDIN">
                        {t("source.LINKEDIN")}
                      </SelectItem>
                      <SelectItem value="WEBSITE">
                        {t("source.WEBSITE")}
                      </SelectItem>
                      <SelectItem value="OTHER">{t("source.OTHER")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showInstagramField ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                      {sourceFieldLabel}
                    </Label>
                    <Input
                      value={form.instagram}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          instagram: event.target.value,
                        }))
                      }
                      placeholder={sourceFieldPlaceholder}
                      className="h-12 rounded-[1rem]"
                    />
                  </div>
                ) : null}

                {showWebsiteField ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                      {sourceFieldLabel}
                    </Label>
                    <Input
                      value={form.website}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          website: event.target.value,
                        }))
                      }
                      placeholder={sourceFieldPlaceholder}
                      className="h-12 rounded-[1rem]"
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                  Observacoes iniciais
                </Label>
                <Textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className="min-h-28 rounded-[1.25rem]"
                />
              </div>

              <Button
                type="button"
                onClick={handleSaveLead}
                disabled={isSavingLead || form.companyName.trim().length < 2}
                className="h-12 w-full rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                {isSavingLead ? (
                  <CircleNotch className="mr-2 size-4 animate-spin" />
                ) : null}
                Salvar alteracoes
              </Button>
            </section>
          ) : null}

          <section className="grid gap-x-6 gap-y-4 border-b border-border/15 pb-8 md:grid-cols-2">
            {lead.nextActionAt && (
              <div className="grid gap-2 md:col-span-2 bg-brand-primary/[0.03] p-4 rounded-2xl border border-brand-primary/10 mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary/70">
                    Lembrete de Acompanhamento
                  </p>
                </div>
                <p className="pl-6 text-sm font-bold text-foreground/90">
                  Retomar contato em{" "}
                  {new Date(lead.nextActionAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
            {visibleInfoItems.map((item) => (
              <div key={item.label} className="grid gap-2">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    {item.label}
                  </p>
                </div>
                <p className="break-words pl-6 text-sm font-semibold leading-relaxed text-foreground/85">
                  {item.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 border-b border-border/15 pb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                Status do lead
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Atualize a etapa conforme a conversa avancar.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={lead.status === status ? "default" : "outline"}
                  onClick={() => handleStatusChange(status)}
                  disabled={Boolean(isUpdatingStatus)}
                  className="justify-start rounded-[1rem] border-border/50 px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  {isUpdatingStatus === status ? (
                    <CircleNotch className="mr-2 size-3.5 animate-spin" />
                  ) : null}
                  {t(`status.${status}`)}
                </Button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 border-b border-border/15 pb-8">
            <Collapsible
              open={quickActionsOpen}
              onOpenChange={setQuickActionsOpen}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                    Mensagens e Templates
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground/70">
                    Acelere o contato com o cliente usando mensagens prontas.
                  </p>
                </div>

                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
                  >
                    {quickActionsOpen ? "Ocultar" : "Mostrar"}
                    <CaretDown
                      className={`ml-2 size-4 transition-transform ${
                        quickActionsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="pt-6 space-y-6">
                <div className="grid gap-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    Templates Disponiveis
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((tpl) => (
                      <Button
                        key={tpl.id}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUseTemplate(tpl.content)}
                        className="rounded-full text-[9px] font-black uppercase tracking-widest bg-muted/20 border border-border/40"
                      >
                        {tpl.name}
                      </Button>
                    ))}
                    {templates.length === 0 && (
                      <p className="text-[9px] font-medium text-muted-foreground/40 italic p-1">
                        Nenhum template cadastrado ainda.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                      Mensagem Personalizada
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSavingTemplate || !customMessage}
                      onClick={handleSaveAsTemplate}
                      className="h-7 rounded-full text-[8px] font-black uppercase tracking-widest"
                    >
                      <Plus className="mr-1 size-3" />
                      Salvar como Template
                    </Button>
                  </div>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Selecione um template acima ou escreva sua mensagem..."
                    className="min-h-[120px] rounded-2xl border-border/40 bg-background/50 text-sm"
                  />
                  <Button
                    asChild
                    disabled={!whatsappUrl || !customMessage}
                    className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-600/20"
                  >
                    {whatsappUrl && customMessage ? (
                      <a href={whatsappUrl} target="_blank" rel="noreferrer">
                        <WhatsappLogo
                          size={18}
                          weight="fill"
                          className="mr-2"
                        />
                        Enviar via WhatsApp
                      </a>
                    ) : (
                      <span>
                        <DeviceMobile size={18} className="mr-2" />
                        Configure um telefone
                      </span>
                    )}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

          <section className="grid gap-4 border-b border-border/15 pb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                Registrar nota
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Salve contexto da conversa. Isso gerara uma atividade no feed.
              </p>
            </div>

            <div className="grid gap-3">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex: respondeu que vai avaliar ainda esta semana."
                className="min-h-28 rounded-[1.35rem] border-border/50 bg-background/80 p-4 text-sm leading-relaxed"
              />
              <Button
                type="button"
                onClick={handleAddNote}
                disabled={isSavingNote || note.trim().length < 2}
                className="h-12 w-full rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                {isSavingNote ? (
                  <CircleNotch className="mr-2 size-4 animate-spin" />
                ) : (
                  <ChatCircleText className="mr-2 size-4" />
                )}
                Salvar nota
              </Button>
            </div>
          </section>

          <section className="grid gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                Linha do Tempo
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Historico estruturado de acoes e contatos.
              </p>
            </div>

            <LeadActivityFeed activities={lead.activities || []} />
          </section>

          <section className="grid gap-3 pt-8 border-t border-border/15">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700 dark:text-red-300">
              Remover lead
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/70">
              Acao irreversivel para leads descartados.
            </p>

            <Dialog
              onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                  setConfirmValue("")
                  setDeleteError(false)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-full border-red-500/20 text-red-700 hover:bg-red-500/10 dark:text-red-300"
                >
                  <Trash className="mr-2 size-4" />
                  Excluir lead
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-xl border-none bg-background/95 p-0 text-left overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="bg-red-600/10 p-10 pb-6">
                  <DialogHeader className="gap-5">
                    <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-red-600 text-white shadow-xl shadow-red-600/20">
                      <Warning weight="bold" className="size-8" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <DialogTitle className="font-heading text-3xl font-black tracking-tight text-red-600">
                        Excluir lead
                      </DialogTitle>
                      <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-red-600/60">
                        Acao critica e irreversivel
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                </div>

                <div className="p-10 pt-6">
                  <p className="mb-10 text-base font-medium leading-relaxed text-muted-foreground/80">
                    Essa acao remove {lead.companyName} do Comercial em
                    definitivo.
                  </p>

                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Confirme o codigo de seguranca:
                      </Label>

                      <div className="relative flex flex-col gap-4">
                        <div className="flex items-center justify-center rounded-[1.5rem] border-2 border-dashed border-red-600/20 bg-red-600/5 py-10">
                          <span className="font-mono text-5xl font-black tracking-[0.5em] text-red-600">
                            {confirmCode}
                          </span>
                        </div>

                        <Input
                          value={confirmValue}
                          onChange={(event) => {
                            setConfirmValue(event.target.value)
                            setDeleteError(false)
                          }}
                          placeholder="DIGITE O CODIGO ACIMA"
                          className="h-20 rounded-[1.5rem] border-border/40 bg-muted/10 text-center font-mono text-3xl font-black uppercase tracking-[0.3em] focus:border-red-600/40"
                        />
                      </div>

                      {deleteError ? (
                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-600">
                          O codigo digitado nao confere.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-12 grid grid-cols-2 gap-5">
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest"
                      >
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button
                      className="h-16 rounded-[1.25rem] bg-red-600 font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 hover:bg-red-700"
                      onClick={handleDelete}
                      disabled={
                        isDeleting || confirmValue.toUpperCase() !== confirmCode
                      }
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-3">
                          <div className="size-5 animate-spin rounded-full border-3 border-white/20 border-t-white" />
                          <span>Excluindo...</span>
                        </div>
                      ) : (
                        <span>Confirmar exclusao</span>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </section>
        </div>

        <ConvertLeadDialog
          lead={lead}
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          clients={clients}
        />
      </SheetContent>
    </Sheet>
  )
}
