"use client"

import * as React from "react"

import { useRouter } from "@/src/i18n/navigation"
import { MagnifyingGlass } from "@phosphor-icons/react"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/src/components/ui/command"

import {
  SEARCH_GROUPS,
  SearchCountPills,
  SearchResultSection,
  getGroupedResults,
} from "@/src/components/common/global-search-shared"

import type { GlobalSearchResult } from "@/src/lib/actions/search.actions"
import { searchAdminGlobal } from "@/src/lib/actions/search.actions"

interface AdminSearchPageProps {
  initialQuery: string
  initialResults: GlobalSearchResult[]
}

export function AdminSearchPage({
  initialQuery,
  initialResults,
}: AdminSearchPageProps): React.JSX.Element {
  const router = useRouter()
  const [query, setQuery] = React.useState(initialQuery)
  const [results, setResults] = React.useState(initialResults)
  const [isSearching, startSearching] = React.useTransition()

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = window.setTimeout(() => {
      startSearching(async () => {
        const response = await searchAdminGlobal(query, "full")
        setResults(response)
      })
    }, 220)

    return () => window.clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace({
        pathname: "/admin/search",
        query: query.trim() ? { q: query.trim() } : undefined,
      })
    }, 260)

    return () => window.clearTimeout(timer)
  }, [query, router])

  const grouped = getGroupedResults(results)

  const handleSelect = (result: GlobalSearchResult): void => {
    if (result.type === "client") {
      router.push({
        pathname: "/admin/clients/[id]",
        params: { id: result.targetId },
      })
      return
    }

    if (result.type === "lead") {
      window.sessionStorage.setItem("crm-open-lead", result.targetId)
      router.push("/admin/crm")
      return
    }

    router.push({
      pathname: "/admin/projects/[id]",
      params: { id: result.targetId },
      query: result.targetTab
        ? {
            tab: result.targetTab,
            ...(result.highlightId ? { highlight: result.highlightId } : {}),
          }
        : undefined,
    })
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-4 border-b border-border/20 pb-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            Busca avançada
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Buscar em todo o sistema
          </h1>
        </div>

        <Command className="rounded-[2rem] border border-border/35 bg-background/60 p-0 shadow-sm">
          <div className="border-b border-border/20 p-4">
            <div className="rounded-[1.5rem] border border-border/30 bg-background/70 p-3">
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar clientes, projetos, leads, arquivos, comentários ou atividades..."
              />
            </div>
          </div>

          {query.trim().length >= 2 ? (
            <CommandList className="max-h-none p-4">
              <SearchCountPills grouped={grouped} groups={SEARCH_GROUPS} />
            </CommandList>
          ) : null}
        </Command>
      </header>

      <section className="grid gap-4">
        {query.trim().length < 2 ? (
          <div className="rounded-[2rem] border border-dashed border-border/35 bg-background/40 px-6 py-16 text-center">
            <MagnifyingGlass className="mx-auto size-8 text-muted-foreground/35" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Digite pelo menos 2 caracteres
            </p>
          </div>
        ) : null}

        {query.trim().length >= 2 && !isSearching && results.length === 0 ? (
          <CommandEmpty className="rounded-[2rem] border border-dashed border-border/35 bg-background/40 py-16 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Nenhum resultado encontrado
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              Tente por nome da empresa, título de update, arquivo ou trecho do
              comentário.
            </p>
          </CommandEmpty>
        ) : null}

        {isSearching ? (
          <div className="rounded-[2rem] border border-border/35 bg-background/40 px-6 py-16 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Buscando resultados...
            </p>
          </div>
        ) : null}

        {query.trim().length >= 2 && results.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {SEARCH_GROUPS.map((group) => (
              <SearchResultSection
                key={group.key}
                config={group}
                results={grouped[group.key]}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
