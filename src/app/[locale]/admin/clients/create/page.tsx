import * as React from "react"

import { getTranslations } from "next-intl/server"

import { CreateClientForm } from "@/src/components/admin/CreateClientForm"

export default async function CreateClientPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.clients")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <div className="flex flex-col gap-1 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
            New Access
          </p>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-5xl">
            {t("create")}
          </h1>
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/10 p-8 backdrop-blur-sm">
          <CreateClientForm t={t} />
        </div>
      </div>
    </main>
  )
}
