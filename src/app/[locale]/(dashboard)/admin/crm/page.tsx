import { getTranslations } from 'next-intl/server'
import { ChartLineUp, Users, Target, CurrencyDollar } from '@phosphor-icons/react/dist/ssr'

import { CreateLeadForm } from '@/src/components/admin/CreateLeadForm'
import { LeadsTable } from '@/src/components/admin/LeadsTable'
import { getLeads } from '@/src/lib/actions/crm.actions'
import { Lead } from '@/src/types/crm'

export default async function CRMPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('Admin.crm')
  const leads = await getLeads()

  const stats = [
    {
      label: t('stats.total'),
      value: leads.length,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: t('stats.converted'),
      value: leads.filter((l: Lead) => l.status === 'CONVERTIDO').length,
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: t('stats.negotiation'),
      value: leads.filter((l: Lead) => l.status === 'NEGOCIACAO').length,
      icon: ChartLineUp,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: t('stats.value'),
      value: 'R$ --', // Placeholder for total estimated value
      icon: CurrencyDollar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
            {t('eyebrow')}
          </p>
          <h1 className="text-4xl font-black tracking-tighter md:text-5xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground/80">
            {t('description')}
          </p>
        </div>
        <CreateLeadForm />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-6 backdrop-blur-md transition-all hover:border-brand-primary/40"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
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

      <section className="space-y-4">
        <LeadsTable leads={leads} />
      </section>
    </div>
  )
}
