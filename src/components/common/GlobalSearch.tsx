"use client"

import * as React from "react"

import { useRouter } from "@/src/i18n/navigation"
import type { GlobalSearchResult } from "@/src/lib/actions/search.actions"
import { searchAdminGlobal } from "@/src/lib/actions/search.actions"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/src/components/ui/command"

import {
  AdvancedSearchButton,
  getGroupedResults,
  SearchResultSection,
  SEARCH_GROUPS,
} from "@/src/components/common/global-search-shared"

const QUICK_GROUPS = SEARCH_GROUPS.filter((group) =>
  ["client", "project", "lead", "update"].includes(group.key)
)

export function GlobalSearch(): React.JSX.Element {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<GlobalSearchResult[]>([])
  const [isSearching, startSearching] = React.useTransition()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = window.setTimeout(() => {
      startSearching(async () => {
        const response = await searchAdminGlobal(query, "quick")
        setResults(response)
      })
    }, 220)

    return () => window.clearTimeout(timer)
  }, [query])

  const grouped = getGroupedResults(results)

  const goToAdvancedSearch = React.useCallback(() => {
    setOpen(false)
    router.push({
      pathname: "/admin/search",
      query: query.trim() ? { q: query.trim() } : undefined,
    })
  }, [query, router])

  const handleSelect = (result: GlobalSearchResult): void => {
    setOpen(false)
    setQuery("")

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
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-10 min-w-52 items-center justify-between rounded-full border-border/50 bg-background/80 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70 md:flex"
      >
        <span className="inline-flex items-center gap-2">
          <MagnifyingGlass className="size-4" />
          Busca global
        </span>
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">
          Ctrl K
        </span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
      >
        <MagnifyingGlass className="size-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Busca rápida"
        description="Busque clientes, projetos, leads e updates. Use a página própria para a busca completa."
        className="max-w-3xl border border-border/40 bg-background/95 p-0 shadow-2xl"
      >
        <Command className="overflow-hidden rounded-[2rem] bg-transparent p-0">
          <div className="border-b border-border/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] px-5 py-5">
            <div className="rounded-[1.65rem] border border-border/35 bg-background/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <CommandInput
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Buscar clientes, projetos, leads ou updates..."
                  className="text-sm"
                />

                <AdvancedSearchButton
                  onClick={goToAdvancedSearch}
                  label="Busca avançada"
                />
              </div>
            </div>
          </div>

          <CommandList className="max-h-[28rem] bg-background/30 p-4">
            {query.trim().length >= 2 && !isSearching && results.length === 0 ? (
              <CommandEmpty className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/55 py-12 text-center">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                    Nenhum resultado rápido encontrado
                  </p>
                  <div className="flex justify-center">
                    <AdvancedSearchButton
                      onClick={goToAdvancedSearch}
                      label="Ir para a busca avançada"
                    />
                  </div>
                </div>
              </CommandEmpty>
            ) : null}

            {isSearching ? (
              <div className="rounded-[1.5rem] border border-border/35 bg-background/55 px-4 py-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                  Buscando resultados...
                </p>
              </div>
            ) : null}

            {query.trim().length >= 2 && results.length > 0 ? (
              <div className="grid gap-4">
                {QUICK_GROUPS.map((group) => (
                  <SearchResultSection
                    key={group.key}
                    config={group}
                    results={grouped[group.key]}
                    onSelect={handleSelect}
                    compact
                  />
                ))}
              </div>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
