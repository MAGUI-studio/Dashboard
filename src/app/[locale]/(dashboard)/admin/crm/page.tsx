import { getTranslations } from "next-intl/server"

import { Lead } from "@/src/types/crm"
import {
  CalendarDots,
  ChartLineUp,
  ClockCountdown,
  CurrencyDollar,
  SealWarning,
  Target,
  Users,
} from "@phosphor-icons/react/dist/ssr"

import { CreateLeadForm } from "@/src/components/admin/CreateLeadForm"
import { LeadsTable } from "@/src/components/admin/LeadsTable"

import { getLeads } from "@/src/lib/actions/crm.actions"

export default async function CRMPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.crm")
  const leads = await getLeads()
  const now = new Date()
  const leadsWithNextAction = leads.filter((lead: Lead) => lead.nextActionAt)
  const overdueLeads = leadsWithNextAction.filter(
    (lead: Lead) => new Date(lead.nextActionAt as string | Date) < now
  )
  const dueTodayLeads = leadsWithNextAction.filter((lead: Lead) => {
    const date = new Date(lead.nextActionAt as string | Date)
    return date.toDateString() === now.toDateString()
  })
  const hotPipelineLeads = leads.filter(
    (lead: Lead) =>
      lead.status === "NEGOCIACAO" || lead.status === "CONTATO_REALIZADO"
  )

  const stats = [
    {
      label: t("stats.total"),
      value: leads.length,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("stats.converted"),
      value: leads.filter((l: Lead) => l.status === "CONVERTIDO").length,
      icon: Target,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: t("stats.negotiation"),
      value: leads.filter((l: Lead) => l.status === "NEGOCIACAO").length,
      icon: ChartLineUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: t("stats.value"),
      value: "R$ --",
      icon: CurrencyDollar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Follow-ups vencidos",
      value: overdueLeads.length,
      icon: SealWarning,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Para hoje",
      value: dueTodayLeads.length,
      icon: CalendarDots,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      label: "Pipeline quente",
      value: hotPipelineLeads.length,
      icon: ClockCountdown,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl font-black tracking-tighter md:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground/80">
            {t("description")}
          </p>
        </div>
        <CreateLeadForm />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-6 backdrop-blur-md transition-all hover:border-brand-primary/40"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
            >
              <stat.icon size={24} weight="bold" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.10),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                Central async
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Fila de proximos movimentos
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground/75">
                Use esta fila como caixa de entrada comercial: quem precisa de
                follow-up, quem esta quente e quem pode travar seu pipeline se
                ficar sem resposta.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
                Prioridade do dia
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {overdueLeads.length + dueTodayLeads.length}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {leadsWithNextAction.slice(0, 5).map((lead: Lead) => {
              const nextActionDate = new Date(
                lead.nextActionAt as string | Date
              )
              const isOverdue = nextActionDate < now

              return (
                <div
                  key={lead.id}
                  className="flex flex-col gap-3 rounded-[1.5rem] border border-border/40 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">
                      {lead.companyName}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/55">
                      {lead.status} • {lead.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
                        Proxima acao
                      </p>
                      <p
                        className={`mt-1 text-sm font-black ${isOverdue ? "text-red-500" : "text-foreground"}`}
                      >
                        {nextActionDate.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                        isOverdue
                          ? "bg-red-500/10 text-red-500"
                          : "bg-brand-primary/10 text-brand-primary"
                      }`}
                    >
                      {isOverdue ? "Urgente" : "Agendado"}
                    </div>
                  </div>
                </div>
              )
            })}

            {leadsWithNextAction.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border/40 bg-muted/10 p-8 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/40">
                Nenhum follow-up agendado ainda.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/60 bg-background/40 p-6 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            Leitura operacional
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            O que pode exigir voce hoje
          </h2>

          <div className="mt-6 grid gap-3">
            {[
              {
                label: "Leads vencidos",
                value: overdueLeads.length,
                hint: "Atrasos em follow-up esfriam negociacoes rapido.",
              },
              {
                label: "Leads para hoje",
                value: dueTodayLeads.length,
                hint: "Bom bloco para responder sem abrir reuniao.",
              },
              {
                label: "Em negociacao",
                value: leads.filter(
                  (lead: Lead) => lead.status === "NEGOCIACAO"
                ).length,
                hint: "Momento ideal para consolidar escopo e valor.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-border/40 bg-muted/10 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight">
                      {item.value}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground/70">
                  {item.hint}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <LeadsTable leads={leads} />
      </section>
    </div>
  )
}
