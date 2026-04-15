"use client"

import * as React from "react"

import Image from "next/image"
import Link from "next/link"

import { SignIn } from "@clerk/nextjs"
import { type Variants, motion } from "framer-motion"

import { LanguageSwitcher } from "@/src/components/common/languageSwitcher"
import { Logo } from "@/src/components/common/logo"
import { ThemeToggle } from "@/src/components/common/themeToggle"

const VARIANTS_FADE_IN_LEFT: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

const VARIANTS_FADE_IN_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function SignInPage(): React.JSX.Element {
  return (
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-x-hidden bg-background lg:flex-row">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={VARIANTS_FADE_IN_LEFT}
        className="fixed top-8 left-8 z-50 flex items-center gap-3"
      >
        <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/60 p-1.5 backdrop-blur-md shadow-sm">
          <LanguageSwitcher />
          <div className="h-4 w-px bg-border/40" />
          <ThemeToggle />
        </div>
      </motion.div>

      <section className="absolute inset-0 z-0 h-full w-full">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full overflow-hidden lg:w-3/5 lg:[clip-path:polygon(0_0,100%_0,85%_100%,0%_100%)]"
        >
          <Image
            src="/images/auth01.webp"
            alt="MAGUI.studio Authentication"
            fill
            priority
            className="object-cover grayscale-[0.3] brightness-[0.4] transition-all duration-700 hover:scale-105 lg:brightness-105 lg:grayscale-[0.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/30 via-transparent to-transparent brightness-90 lg:from-brand-primary/10" />
        </motion.div>

        <div className="absolute inset-0 z-10 bg-black/70 lg:hidden" />
      </section>

      <div className="relative z-30 flex min-h-svh w-full flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-3/5" />

        <motion.section
          initial="hidden"
          animate="visible"
          variants={VARIANTS_FADE_IN_UP}
          className="flex min-h-svh w-full flex-col items-center justify-center bg-background px-6 py-20 lg:w-2/5 lg:py-6"
        >
          <div className="flex w-full max-w-[420px] flex-col items-center lg:items-start">
            <Link
              href="/"
              className="mb-14 transition-transform hover:scale-105 active:scale-95"
            >
              <Logo width={180} />
            </Link>

            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full border-none bg-transparent shadow-none p-0",
                  headerTitle:
                    "font-heading text-4xl font-black uppercase leading-[0.86] tracking-[-0.05em] text-foreground mb-3",
                  headerSubtitle:
                    "text-base font-medium leading-relaxed text-muted-foreground/80",
                  socialButtonsBlockButton:
                    "rounded-2xl border border-border/80 bg-background hover:bg-muted transition-all duration-300 h-14 shadow-sm group",
                  socialButtonsBlockButtonText:
                    "font-sans font-bold uppercase text-[10px] tracking-widest text-foreground/80 group-hover:text-foreground",
                  formButtonPrimary:
                    "rounded-full h-14 bg-brand-primary hover:bg-brand-primary/90 transition-all font-sans font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl shadow-brand-primary/40 mt-6 active:scale-95",
                  footerActionLink:
                    "text-brand-primary hover:text-brand-primary/80 transition-colors font-sans font-black uppercase text-[10px] tracking-widest",
                  formFieldInput:
                    "h-14 rounded-2xl border border-border/80 bg-background focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-sm",
                  dividerLine: "bg-border/40",
                  dividerText:
                    "text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50",
                  formFieldLabel:
                    "text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 mb-2.5 ml-1",
                  identityPreviewText: "font-sans font-bold text-foreground",
                  footerActionText:
                    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
                  navbar: "bg-background",
                  scrollBox: "bg-background shadow-none",
                  alert:
                    "bg-background border border-border/60 shadow-none rounded-2xl",
                  formFieldInputShowPasswordButton:
                    "text-muted-foreground hover:text-foreground",
                },
              }}
            />

            <div className="mt-16 border-t border-border/40 pt-8 w-full">
              <p className="text-[9px] font-bold uppercase tracking-[0.45em] text-muted-foreground/40 text-center lg:text-left">
                © MAGUI.studio • Digital Authority System
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
