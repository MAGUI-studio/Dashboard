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
    <div className="min-h-full px-6 py-12 lg:px-12 lg:py-24 space-y-48">
      {/* --- HERO SECTION --- */}
      <header className="grid gap-20 xl:grid-cols-[1fr_auto_400px]">
        <div className="space-y-16">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-brand-primary/60" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/60">
              {t("crmBadge")}
            </span>
          </div>

          <div className="relative h-24 w-full max-w-[420px] -ml-2">
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

          <div className="space-y-10">
            <h1 className="text-5xl font-black leading-[0.8] tracking-[-0.06em] lg:text-7xl xl:text-8xl">
              {t("landingTitle")}
            </h1>
            <p className="max-w-3xl text-2xl font-medium leading-tight tracking-tight text-muted-foreground lg:text-4xl">
              {t("crmDescription")}
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden w-[1px] bg-border/40 xl:block" />

        {/* How it Works Column */}
        <div className="space-y-12 xl:pt-48">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
              {t("landingEyebrow")}
            </p>
            <div className="h-1 w-8 bg-brand-primary" />
          </div>
          <div className="space-y-10">
            {[
              { id: "01", text: t("landingPointOne") },
              { id: "02", text: t("landingPointTwo") },
              { id: "03", text: t("landingPointThree") },
            ].map((step) => (
              <div key={step.id} className="group space-y-3">
                <span className="text-[10px] font-black text-brand-primary/40 group-hover:text-brand-primary transition-colors">
                  {step.id}
                </span>
                <p className="text-lg leading-snug text-muted-foreground/80 lg:text-xl">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- MANAGEMENT SECTION --- */}
      <div className="grid gap-32 border-t border-border/40 pt-24 xl:grid-cols-2 xl:gap-64">
        {/* Profile Editor Column */}
        <section className="space-y-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-brand-primary">
                /
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("registerEyebrow")}
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter lg:text-5xl">
              {t("registerTitle")}
            </h2>
          </div>
          <div className="max-w-2xl">
            <MaguiConnectEditor initialProfile={profile} />
          </div>
        </section>

        {/* Links List Column */}
        <section className="space-y-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-brand-primary">
                /
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("linksEyebrow")}
              </span>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter lg:text-5xl">
                {t("linksTitle")}
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground/80">
                {t("linksDescription")}
              </p>
            </div>
          </div>
          <div className="max-w-2xl">
            <MaguiConnectLinkList links={links} />
          </div>
        </section>
      </div>
    </div>
  )
}
