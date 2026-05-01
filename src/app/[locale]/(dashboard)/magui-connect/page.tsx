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
    <div className="min-h-full px-6 py-10 lg:px-12 lg:py-14">
      <div className="grid gap-14 xl:grid-cols-[minmax(340px,0.95fr)_minmax(0,1.05fr)]">
        <section className="space-y-10 xl:sticky xl:top-24 xl:self-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              {t("crmBadge")}
            </div>

            <div className="relative h-9 w-[220px]">
              <Image
                src="/logos/connect/connect_DM.svg"
                alt="Magui Connect"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/logos/connect/connect_LM.svg"
                alt="Magui Connect"
                fill
                className="hidden object-contain dark:block"
                priority
              />
            </div>

            <div className="space-y-4">
              <h1 className="max-w-[10ch] text-4xl font-black tracking-[-0.06em] md:text-5xl">
                {t("landingTitle")}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                {t("crmDescription")}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-l border-border/50 pl-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("landingEyebrow")}
            </p>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{t("landingPointOne")}</p>
              <p>{t("landingPointTwo")}</p>
              <p>{t("landingPointThree")}</p>
            </div>
          </div>
        </section>

        <section className="space-y-14">
          <div className="border-b border-border/60 pb-10">
            <MaguiConnectEditor initialProfile={profile} />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("linksEyebrow")}
              </p>
              <h2 className="text-2xl font-black tracking-tight">
                {t("linksTitle")}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t("linksDescription")}
              </p>
            </div>
            <MaguiConnectLinkList links={links} />
          </div>
        </section>
      </div>
    </div>
  )
}
