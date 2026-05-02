import { getTranslations } from "next-intl/server"
import Image from "next/image"

import { MaguiConnectEditor } from "@/src/components/client/maguiConnect/MaguiConnectEditor"
import { MaguiConnectLinkList } from "@/src/components/client/maguiConnect/MaguiConnectLinkList"

import { getOwnMaguiConnectProfile } from "@/src/lib/maguiConnectData"
import { getCurrentAppUser } from "@/src/lib/project-governance"

export async function generateMetadata() {
  const t = await getTranslations("MaguiConnect")
  return {
    title: t("pageTitle"),
  }
}

export default async function MaguiConnectPage() {
  const user = await getCurrentAppUser()
  if (!user) return null

  const t = await getTranslations("MaguiConnect")
  const profile = await getOwnMaguiConnectProfile(user.id)
  const links = profile?.links ?? []

  return (
    <div className="min-h-full px-6 py-12 lg:px-12 lg:py-16 space-y-24">
      {/* --- HERO SECTION --- */}
      <header className="grid gap-16 xl:grid-cols-[1fr_auto_400px]">
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-brand-primary/60" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/60">
              {t("crmBadge")}
            </span>
          </div>

          <div className="relative h-20 w-full max-w-[360px] -ml-2">
            <Image
              src="/logos/connect/connect_DM.svg"
              alt="Magui Connect"
              fill
              className="object-contain object-left dark:hidden"
              priority
            />
            <Image
              src="/logos/connect/connect_LM.svg"
              alt="Magui Connect"
              fill
              className="hidden object-contain object-left dark:block"
              priority
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-black leading-[0.85] tracking-[-0.04em] lg:text-6xl xl:text-7xl">
              {t("landingTitle")}
            </h1>
            <p className="max-w-2xl text-xl font-medium leading-tight tracking-tight text-muted-foreground lg:text-2xl">
              {t("crmDescription")}
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden w-[1px] bg-border/40 xl:block" />

        {/* How it Works Column */}
        <div className="space-y-8 xl:pt-24">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
              {t("landingEyebrow")}
            </p>
            <div className="h-1 w-8 bg-brand-primary" />
          </div>
          <div className="space-y-6">
            {[
              { id: "01", text: t("landingPointOne") },
              { id: "02", text: t("landingPointTwo") },
              { id: "03", text: t("landingPointThree") },
            ].map((step) => (
              <div key={step.id} className="group space-y-2">
                <span className="text-[10px] font-black text-brand-primary/40 group-hover:text-brand-primary transition-colors">
                  {step.id}
                </span>
                <p className="text-base leading-snug text-muted-foreground/80 lg:text-lg">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- MANAGEMENT SECTION --- */}
      <div className="grid gap-16 border-t border-border/40 pt-16 xl:grid-cols-[1.2fr_1fr] xl:gap-24">
        {/* Profile Editor Column */}
        <section className="space-y-10 w-full max-w-4xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter lg:text-4xl">
              {t("registerTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("registerDescription")}
            </p>
          </div>
          <MaguiConnectEditor initialProfile={profile} />
        </section>

        {/* Links List Column */}
        <section className="space-y-10 w-full">
          <MaguiConnectLinkList links={links} />
        </section>
      </div>
    </div>
  )
}
