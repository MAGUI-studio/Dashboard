import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { BookOpen, CaretRight, Megaphone } from "@phosphor-icons/react/dist/ssr"

import { getCurrentAppUser } from "@/src/lib/project-governance"

interface DocsLayoutProps {
  children: React.ReactNode
}

export default async function DocsLayout({ children }: DocsLayoutProps) {
  const user = await getCurrentAppUser()
  const isAdmin = user?.role === "ADMIN"

  const adminNav = [
    {
      title: "Geral",
      items: [
        { label: "Visão Geral", href: "/docs" },
        { label: "Arquitetura", href: "/docs/admin/arquitetura" },
      ],
    },
    {
      title: "Operação",
      items: [
        { label: "Handoff Comercial", href: "/docs/admin/comercial" },
        { label: "Gestão de Projetos", href: "/docs/admin/operacao" },
        { label: "Financeiro", href: "/docs/admin/financeiro" },
      ],
    },
  ]

  const clientNav = [
    {
      title: "Início",
      items: [
        { label: "Primeiros Passos", href: "/docs/client/primeiros-passos" },
      ],
    },
    {
      title: "Seu Projeto",
      items: [
        { label: "Como Acompanhar", href: "/docs/client/meu-projeto" },
        { label: "Briefing e Materiais", href: "/docs/client/briefing" },
        { label: "Aprovações", href: "/docs/client/aprovacoes" },
      ],
    },
  ]

  return (
    <div className="flex flex-1 flex-col lg:flex-row gap-12 p-6 lg:p-12">
      <aside className="w-full lg:w-72 shrink-0 space-y-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-primary">
            <BookOpen weight="fill" className="size-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Knowledge Base
            </span>
          </div>
          <h2 className="font-heading text-3xl font-black uppercase tracking-tight">
            Docs
          </h2>
        </div>

        <nav className="space-y-8">
          {(isAdmin ? adminNav : clientNav).map((group, i) => (
            <div key={i} className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4">
                {group.title}
              </h4>
              <div className="grid gap-1">
                {group.items.map((item, j) => (
                  <Link
                    key={j}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={item.href as any}
                    className="flex items-center justify-between group px-4 py-2.5 rounded-xl hover:bg-muted/10 transition-all"
                  >
                    <span className="text-sm font-bold text-foreground/70 group-hover:text-foreground">
                      {item.label}
                    </span>
                    <CaretRight className="size-3 text-muted-foreground/20 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border/40">
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={"/docs/changelog" as any}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground/70 hover:text-foreground"
            >
              <Megaphone className="size-4" /> Changelog
            </Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="rounded-[2.5rem] border border-border/40 bg-background/40 p-8 lg:p-16 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
