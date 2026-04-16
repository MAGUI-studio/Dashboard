import { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"

import { enUS, ptBR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import "@clerk/ui/themes/shadcn.css"
import { GoogleAnalytics } from "@next/third-parties/google"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"

import { ThemeProvider } from "@/src/components/common/themeProvider"

import { cn } from "@/src/lib/utils/utils"

import { env } from "@/src/config/env"
import { fontVariables } from "@/src/config/fonts"
import { siteConfig } from "@/src/config/site"

import { ourFileRouter } from "@/src/app/api/uploadthing/core"
import "@/src/app/globals.css"

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Config")
  const ogUrl = new URL(`${siteConfig.url}/api/og`)
  ogUrl.searchParams.set("title", t("name"))
  ogUrl.searchParams.set("description", t("description"))

  return {
    title: {
      default: t("name"),
      template: `%s | ${t("name")}`,
    },
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim()),
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      type: "website",
      url: siteConfig.url,
      title: t("name"),
      description: t("description"),
      siteName: t("name"),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: t("name"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("name"),
      description: t("description"),
      images: [ogUrl.toString()],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: `${siteConfig.url}/site.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t("name"),
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>): Promise<React.JSX.Element> {
  const { locale } = await params
  const messages = await getMessages()
  const t = await getTranslations("Config")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("name"),
    description: t("description"),
    url: siteConfig.url,
  }

  const clerkLocalization = locale === "pt" ? ptBR : enUS

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("antialiased", fontVariables)}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="mx-auto w-full max-w-440">
        <ClerkProvider
          localization={clerkLocalization}
          publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{ theme: shadcn }}
          signInUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          signUpUrl={env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
          signInFallbackRedirectUrl={
            env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
          }
          signUpFallbackRedirectUrl={
            env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
          }
        >
          <NextIntlClientProvider messages={messages}>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <ThemeProvider>{children}</ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>

        {siteConfig.analytics.google && (
          <GoogleAnalytics gaId={siteConfig.analytics.google} />
        )}
      </body>
    </html>
  )
}
