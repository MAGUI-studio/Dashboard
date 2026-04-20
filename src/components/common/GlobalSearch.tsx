"use client"

import * as React from "react"

import { useRouter } from "@/src/i18n/navigation"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/src/components/ui/command"

import {
  GlobalSearchResult,
  searchAdminGlobal,
} from "@/src/lib/actions/search.actions"

function getGroupedResults(results: GlobalSearchResult[]) {
  return {
    client: results.filter((item) => item.type === "client"),
    project: results.filter((item) => item.type === "project"),
    lead: results.filter((item) => item.type === "lead"),
    update: results.filter((item) => item.type === "update"),
  }
}

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
        const response = await searchAdminGlobal(query)
        setResults(response)
      })
    }, 220)

    return () => window.clearTimeout(timer)
  }, [query])

  const grouped = getGroupedResults(results)

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

    if (result.type === "project" || result.type === "update") {
      router.push({
        pathname: "/admin/projects/[id]",
        params: { id: result.targetId },
      })
      return
    }

    window.sessionStorage.setItem("crm-open-lead", result.targetId)
    router.push("/admin/crm")
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
        title="Busca global"
        description="Busque clientes, projetos, leads e updates."
        className="max-w-3xl"
      >
        <Command className="rounded-[2rem]">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar clientes, projetos, leads ou updates..."
          />
          <CommandList className="max-h-[28rem] p-2">
            {query.trim().length < 2 ? (
              <div className="px-4 py-10 text-center text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                Digite pelo menos 2 caracteres para buscar
              </div>
            ) : null}

            {query.trim().length >= 2 &&
            !isSearching &&
            results.length === 0 ? (
              <CommandEmpty className="py-10 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                Nenhum resultado encontrado
              </CommandEmpty>
            ) : null}

            {isSearching ? (
              <div className="px-4 py-10 text-center text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                Buscando...
              </div>
            ) : null}

            {grouped.client.length > 0 ? (
              <CommandGroup heading="Clientes">
                {grouped.client.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`${result.title} ${result.subtitle} ${result.meta}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer rounded-2xl"
                  >
                    <div className="grid gap-1">
                      <p className="text-sm font-black tracking-tight text-foreground">
                        {result.title}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
                        {result.subtitle}
                      </p>
                    </div>
                    <span className="ml-auto text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                      {result.meta}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {grouped.project.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Projetos">
                  {grouped.project.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.title} ${result.subtitle} ${result.meta}`}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer rounded-2xl"
                    >
                      <div className="grid gap-1">
                        <p className="text-sm font-black tracking-tight text-foreground">
                          {result.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className="ml-auto text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {result.meta}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {grouped.lead.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Comercial">
                  {grouped.lead.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.title} ${result.subtitle} ${result.meta}`}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer rounded-2xl"
                    >
                      <div className="grid gap-1">
                        <p className="text-sm font-black tracking-tight text-foreground">
                          {result.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className="ml-auto text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {result.meta}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {grouped.update.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Updates">
                  {grouped.update.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.title} ${result.subtitle} ${result.meta}`}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer rounded-2xl"
                    >
                      <div className="grid gap-1">
                        <p className="text-sm font-black tracking-tight text-foreground">
                          {result.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className="ml-auto text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {result.meta}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
