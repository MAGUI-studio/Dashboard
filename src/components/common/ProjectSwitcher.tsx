"use client"

import * as React from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { CaretUpDown, Check, ProjectorScreen } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

import { cn } from "@/src/lib/utils/utils"

interface ProjectSwitcherProps {
  projects: Array<{
    id: string
    name: string
  }>
  activeId: string
}

export function ProjectSwitcher({ projects, activeId }: ProjectSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const onSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("project", id)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  const activeProject = projects.find((p) => p.id === activeId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between rounded-xl border-border/40 bg-muted/10 px-4 font-bold uppercase tracking-widest text-foreground transition-all hover:bg-muted/20 md:w-[240px]"
        >
          <div className="flex items-center gap-2 truncate">
            <ProjectorScreen
              weight="duotone"
              className="size-4 text-brand-primary"
            />
            <span className="truncate">{activeProject?.name}</span>
          </div>
          <CaretUpDown
            weight="bold"
            className="ml-2 size-3 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl md:w-[240px]">
        <Command className="rounded-2xl">
          <CommandInput
            placeholder="Filtrar projetos..."
            className="h-10 border-none"
          />
          <CommandList className="max-h-48 scrollbar-hide">
            <CommandEmpty className="py-4 text-center text-[10px] font-bold uppercase tracking-widest opacity-40">
              Nenhum projeto encontrado.
            </CommandEmpty>
            <CommandGroup className="p-1">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => onSelect(project.id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 aria-selected:bg-brand-primary/10"
                >
                  <span className="truncate text-[10px] font-bold uppercase tracking-tight text-foreground">
                    {project.name}
                  </span>
                  {activeId === project.id && (
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
  )
}
