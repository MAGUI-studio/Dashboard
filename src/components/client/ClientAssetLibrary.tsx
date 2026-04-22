"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { DashboardAsset } from "@/src/types/dashboard"
import { ClientAssetCard } from "./ClientAssetCard"
import { AssetType } from "@/src/generated/client/enums"
import { Input } from "@/src/components/ui/input"
import { MagnifyingGlass, Funnel, X } from "@phosphor-icons/react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"

interface ClientAssetLibraryProps {
  assets: DashboardAsset[]
}

export function ClientAssetLibrary({ assets }: ClientAssetLibraryProps) {
  const t = useTranslations("Admin.projects.details.asset_types")
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<string>("all")
  
  const filteredAssets = React.useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase())
      const matchesTab = activeTab === "all" || asset.type === activeTab
      return matchesSearch && matchesTab
    })
  }, [assets, search, activeTab])

  if (assets.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-border/30 bg-muted/5 py-20 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          Nenhum arquivo disponível no momento.
        </p>
      </div>
    )
  }

  const assetTypes = Array.from(new Set(assets.map((a) => a.type)))

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            placeholder="Buscar arquivos pelo nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-full border-border/40 bg-muted/5 pl-11 pr-4 text-sm transition-all focus:border-brand-primary/40 focus:ring-0"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="h-12 rounded-full border border-border/20 bg-muted/5 p-1.5">
            <TabsTrigger value="all" className="rounded-full px-5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-brand-primary data-[state=active]:text-white">
              Todos
            </TabsTrigger>
            {assetTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="rounded-full px-5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                {t(type as AssetType)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-border/30 bg-muted/5 py-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            Nenhum arquivo encontrado para esta busca.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <ClientAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  )
}
