"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetType } from "@/src/generated/client/enums"
import { DashboardAsset } from "@/src/types/dashboard"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { ClientAssetCard } from "./ClientAssetCard"

interface ClientAssetLibraryProps {
  assets: DashboardAsset[]
}

export function ClientAssetLibrary({ assets }: ClientAssetLibraryProps) {
  const t = useTranslations("Admin.projects.details.asset_types")
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<string>("all")

  const filteredAssets = React.useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.name
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesTab = activeTab === "all" || asset.type === activeTab
      return matchesSearch && matchesTab
    })
  }, [assets, search, activeTab])

  if (assets.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-border/25 px-6 py-16 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          Nenhum arquivo disponível no momento.
        </p>
      </div>
    )
  }

  const assetTypes = Array.from(new Set(assets.map((a) => a.type)))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            placeholder="Buscar arquivos pelo nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-full border-border/40 bg-muted/20 pl-11 pr-4 text-sm transition-all focus:border-brand-primary/40 focus:ring-0"
          />
        </div>

        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger
            size="lg"
            className="h-12 w-full rounded-full border-border/40 bg-muted/10 px-5 text-[10px] font-black uppercase tracking-widest md:w-56"
          >
            <SelectValue placeholder="Tipo de arquivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                value="all"
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                Todos
              </SelectItem>
              {assetTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  {t(type as AssetType)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-border/25 px-6 py-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            Nenhum arquivo encontrado para esta busca.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <ClientAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  )
}
