"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadStatus } from "@/src/generated/client/enums"
import { Link } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  ArrowSquareOut,
  ChatCircleText,
  CircleNotch,
  PencilSimple,
  RocketLaunch,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
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

import { getLeadActivitiesAction } from "@/src/lib/actions/crm.actions"

import { useLeadMutations } from "@/src/hooks/use-lead-mutations"

import { LeadDeleteDialog } from "./lead-drawer/LeadDeleteDialog"
import { LeadEditForm } from "./lead-drawer/LeadEditForm"
import { LeadInfoDisplay } from "./lead-drawer/LeadInfoDisplay"
import { LeadQuickActions } from "./lead-drawer/LeadQuickActions"

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

type LeadDetailsDrawerProps = {
  lead: Lead
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
  open?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  onLeadUpdated?: (lead: Lead) => void
  onLeadDeleted?: (leadId: string) => void
}

export function LeadDetailsDrawer({
  lead,
  children,
  onOpenChange,
  open: controlledOpen,
  clients,
  templates,
  onLeadUpdated,
  onLeadDeleted,
}: LeadDetailsDrawerProps): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [note, setNote] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen

  const {
    localLead,
    setLocalLead,
    isUpdatingStatus,
    isSavingNote,
    isSavingLead,
    handleStatusChange,
    handleAddNote,
    handleSaveLead,
  } = useLeadMutations(lead, onLeadUpdated)

  const loadExtraData = React.useCallback(
    async (leadId: string) => {
      setIsLoadingData(true)
      const result = await getLeadActivitiesAction(leadId)
      if (result.success && result.activities) {
        setLocalLead((current) => ({
          ...current,
          activities: result.activities,
          followUpNotes: result.notes,
        }))
      }
      setIsLoadingData(false)
    },
    [setLocalLead]
  )

  React.useEffect(() => {
    if (open && localLead.id) {
      loadExtraData(localLead.id)
    }
  }, [open, localLead.id, loadExtraData])

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen)
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      setIsEditing(false)
      setNote("")
    }
  }

  const statuses = [
    LeadStatus.GARIMPAGEM,
    LeadStatus.CONTATO_REALIZADO,
    LeadStatus.NEGOCIACAO,
    LeadStatus.CONVERTIDO,
  ]

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[96vw] overflow-y-auto border-l border-border/30 bg-background/98 p-0 sm:min-w-[40rem] sm:max-w-[42rem]"
      >
        <SheetHeader className="border-b border-border/15 px-8 py-8 text-left">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <SheetTitle className="font-heading text-3xl font-black tracking-tight text-foreground">
                    {localLead.companyName}
                  </SheetTitle>
                  <LeadStatusBadge status={localLead.status} />
                </div>
                <SheetDescription className="text-sm leading-relaxed text-muted-foreground/65">
                  {t(`source.${localLead.source}`)} •{" "}
                  {localLead.activities?.length || 0} atividades
                </SheetDescription>
              </div>
              <div className="flex flex-col items-end gap-3">
                <p className="pt-1 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                  Atualizado em {formatDateTime(localLead.updatedAt)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
                  >
                    <PencilSimple className="mr-2 size-4" />{" "}
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                  {localLead.status !== LeadStatus.CONVERTIDO && (
                    <Button
                      onClick={() => setIsConvertDialogOpen(true)}
                      className="rounded-full bg-brand-primary px-5 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                    >
                      <RocketLaunch className="mr-2 size-4" /> Converter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {localLead.convertedProjectId && (
              <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
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
                      params: { id: localLead.convertedProjectId },
                    }}
                  >
                    Abrir Projeto <ArrowSquareOut className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="grid gap-8 px-8 py-8">
          {isEditing ? (
            <LeadEditForm
              lead={localLead}
              isSaving={isSavingLead}
              onSave={async (data) => {
                const ok = await handleSaveLead(data)
                if (ok) setIsEditing(false)
                return ok
              }}
            />
          ) : null}

          <LeadInfoDisplay lead={localLead} />

          <section className="grid gap-4 border-b border-border/15 pb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
              Status do lead
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {statuses.map((s) => (
                <Button
                  key={s}
                  variant={localLead.status === s ? "default" : "outline"}
                  onClick={() => handleStatusChange(s)}
                  disabled={Boolean(isUpdatingStatus)}
                  className="justify-start rounded-[1rem] border-border/50 px-4 py-5 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  {isUpdatingStatus === s && (
                    <CircleNotch className="mr-2 size-3.5 animate-spin" />
                  )}
                  {t(`status.${s}`)}
                </Button>
              ))}
            </div>
          </section>

          <LeadQuickActions lead={localLead} templates={templates} />

          <section className="grid gap-4 border-b border-border/15 pb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
              Registrar nota
            </p>
            <div className="grid gap-3">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contexto da conversa..."
                className="min-h-28 rounded-[1.35rem] border-border/50 bg-background/80 p-4 text-sm"
              />
              <Button
                onClick={async () => {
                  if (await handleAddNote(note)) setNote("")
                }}
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                  Linha do Tempo
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Historico estruturado.
                </p>
              </div>
              {isLoadingData && (
                <CircleNotch className="size-4 animate-spin text-muted-foreground/40" />
              )}
            </div>
            <LeadActivityFeed activities={localLead.activities || []} />
          </section>

          <LeadDeleteDialog
            leadId={localLead.id}
            companyName={localLead.companyName}
            onDeleted={(id) => {
              setUncontrolledOpen(false)
              onOpenChange?.(false)
              onLeadDeleted?.(id)
            }}
          />
        </div>

        <ConvertLeadDialog
          lead={localLead}
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          clients={clients}
          onConverted={() => {
            handleStatusChange(LeadStatus.CONVERTIDO)
            // setLocalLead updated via mutation hook or manual if needed
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
