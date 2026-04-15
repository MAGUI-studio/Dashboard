"use client"

import * as React from "react"

import Image from "next/image"
import Link from "next/link"

import { SignUp } from "@clerk/nextjs"

import { LanguageSwitcher } from "@/src/components/common/languageSwitcher"
import { Logo } from "@/src/components/common/logo"
import { ThemeToggle } from "@/src/components/common/themeToggle"

export default function SignInPage(): React.JSX.Element {
  return (
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-x-hidden bg-background lg:flex-row">
      {/* Controls Overlay (Top-Left area, over the image side) */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        {/* We override the background/blur here to ensure solid look if the component allows, 
            but for now we just position them. If they have internal glass, we'd need to edit them too. */}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Background Section (Desktop: Clipped Image | Mobile: Full Background) */}
      <section className="absolute inset-0 z-0">
        <div className="relative h-full w-full overflow-hidden lg:w-1/2 lg:[clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)]">
          <Image
            src="/images/auth01.webp"
            alt="MAGUI.studio Authentication"
            fill
            priority
            className="object-cover grayscale-[0.4] brightness-[0.3] lg:brightness-100 lg:grayscale-[0.2]"
          />
          {/* Solid overlay instead of glass */}
          <div className="absolute inset-0 bg-brand-primary/20 brightness-75" />
        </div>

        {/* Mobile Overlay (Darker and Solid) */}
        <div className="absolute inset-0 z-10 bg-black/80 lg:hidden" />
      </section>

      {/* Auth Content Wrapper */}
      <div className="relative z-30 flex min-h-svh w-full flex-col lg:flex-row">
        {/* Spacer for Desktop Image Area */}
        <div className="hidden lg:flex lg:w-1/2" />

        {/* Auth Section - Solid Background */}
        <section className="flex min-h-svh w-full flex-col items-center justify-center bg-background px-6 py-20 lg:w-1/2 lg:py-6">
          <div className="flex w-full max-w-[420px] flex-col items-center lg:items-start">
            <Link href="/" className="mb-12">
              <Logo width={160} />
            </Link>

            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full border-none bg-transparent shadow-none p-0",
                  headerTitle:
                    "font-heading text-4xl font-black uppercase leading-[0.86] tracking-[-0.05em] text-foreground mb-2",
                  headerSubtitle:
                    "text-base font-medium leading-relaxed text-muted-foreground",
                  socialButtonsBlockButton:
                    "rounded-2xl border border-border/80 bg-background hover:bg-muted transition-all duration-300 h-12 shadow-sm",
                  formButtonPrimary:
                    "rounded-full h-12 bg-brand-primary hover:bg-brand-primary/90 transition-all font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-brand-primary/30 mt-4",
                  footerActionLink:
                    "text-brand-primary hover:text-brand-primary/80 transition-colors font-black uppercase text-[10px] tracking-widest",
                  formFieldInput:
                    "h-12 rounded-2xl border border-border/80 bg-background focus:border-brand-primary focus:ring-brand-primary/20 transition-all shadow-sm",
                  dividerLine: "bg-border/30",
                  dividerText:
                    "text-[10px] font-black uppercase tracking-[0.34em] text-muted-foreground/60",
                  formFieldLabel:
                    "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2",
                  identityPreviewText: "font-bold text-foreground",
                  footerActionText:
                    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
                  // Explicitly disable any glass/blur/transparency
                  navbar: "bg-background",
                  scrollBox: "bg-background shadow-none",
                  alert:
                    "bg-background border border-border shadow-none rounded-2xl",
                  formFieldInputShowPasswordButton:
                    "text-muted-foreground hover:text-foreground",
                },
              }}
            />

            {/* Mobile Footer Detail */}
            <div className="mt-12 lg:hidden">
              <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-muted-foreground/40">
                © MAGUI.studio • Client Dashboard
              </p>
            </div>
          </div>

          {/* Desktop Footer Detail */}
          <div className="mt-12 hidden lg:block">
            <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-muted-foreground/30">
              © MAGUI.studio • Client Dashboard System
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
