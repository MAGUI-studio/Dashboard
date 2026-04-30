"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Link from "next/link"

import { SignIn } from "@clerk/nextjs"
import { ArrowUpRight } from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { LanguageSwitcher } from "@/src/components/common/languageSwitcher"
import { Logo } from "@/src/components/common/logo"
import { ThemeToggle } from "@/src/components/common/themeToggle"

import { cn } from "@/src/lib/utils/utils"

export default function SignInPage(): React.JSX.Element {
  const t = useTranslations("Auth.signIn")

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      {/* Background Decorativo - Branding Imersivo */}
      <div className="absolute top-0 right-0 z-0 select-none opacity-[0.03] dark:opacity-[0.05]">
        <span className="font-heading text-[18vw] font-black uppercase leading-none tracking-tighter">
          PORTAL
        </span>
      </div>

      {/* Header - Alinhamento Perfeito */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 flex w-full items-center justify-between p-10 lg:px-16 lg:py-12"
      >
        <Link
          href="/"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Logo width={180} />
        </Link>
        <div className="flex items-center gap-10">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </motion.nav>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 pb-20 lg:px-16">
        <div className="grid w-full grid-cols-1 gap-20 lg:grid-cols-12 lg:gap-0">
          {/* Lado Esquerdo - Tipografia Balanceada */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-primary">
                {t("eyebrow")}
              </span>
              <h1 className="font-heading text-6xl font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-7xl lg:text-[7vw]">
                {t("portal_title")} <br />
                <span className="text-brand-primary">
                  {t("portal_subtitle")}
                </span>
              </h1>
            </div>

            <div className="mt-12 space-y-8">
              <div className="h-1.5 w-24 bg-foreground" />
              <p className="max-w-4xl text-base font-bold uppercase leading-relaxed tracking-[0.2em] text-muted-foreground/80 lg:text-lg">
                {t("marketing_description")}
              </p>

              <Link
                href="https://magui.studio"
                target="_blank"
                className="group flex w-fit items-center gap-4 rounded-full bg-foreground px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-background transition-all hover:bg-brand-primary hover:text-white"
              >
                {t("marketing_cta")}
                <ArrowUpRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </motion.section>

          {/* Lado Direito - Login Refinado */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center lg:col-span-5 lg:items-end"
          >
            <div className="w-full max-w-[440px]">
              <div className="mb-10 space-y-1.5 lg:text-right">
                <h2 className="font-heading text-3xl font-black uppercase tracking-tighter text-foreground lg:text-5xl">
                  {t("ident_title")}
                </h2>
                <div className="h-1 w-16 bg-brand-primary lg:ml-auto" />
              </div>

              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "w-full border-none bg-transparent shadow-none p-0",
                    header: "hidden",
                    main: "gap-10",
                    socialButtonsBlockButton:
                      "rounded-none border-none bg-muted/30 hover:bg-brand-primary hover:text-white transition-all h-16 group",
                    socialButtonsBlockButtonText:
                      "font-sans font-black uppercase text-[10px] tracking-[0.3em] text-foreground",
                    formButtonPrimary:
                      "rounded-none h-20 bg-foreground hover:bg-brand-primary transition-all font-sans font-black uppercase text-xs tracking-[0.4em] mt-2 text-background shadow-none",
                    formFieldInput:
                      "h-16 rounded-none border-none bg-muted/20 focus:bg-muted/40 transition-all font-bold text-foreground px-4 text-lg placeholder:text-muted-foreground/30",
                    formFieldLabel:
                      "text-[10px] font-black uppercase tracking-[0.3em] text-foreground mb-2 ml-0",
                    dividerLine: "bg-border h-px",
                    dividerText:
                      "text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 px-6 bg-background",
                    identityPreviewText: "font-sans font-black text-foreground",
                    footerActionLink:
                      "text-brand-primary hover:text-foreground transition-colors font-black uppercase text-[10px] tracking-widest underline decoration-2 underline-offset-4",
                    footerActionText:
                      "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40",
                    formFieldInputShowPasswordButton:
                      "text-foreground/40 hover:text-brand-primary mr-4",
                    alert:
                      "rounded-none border-none bg-brand-primary/10 shadow-none p-6",
                    alertText:
                      "text-brand-primary font-black uppercase text-[9px] tracking-widest",
                  },
                }}
              />
            </div>
          </motion.section>
        </div>
      </div>

      {/* Footer Equilibrado */}
      <footer className="relative z-20 flex w-full items-center justify-between p-10 lg:px-16 lg:py-12">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/30">
          © {new Date().getFullYear()} MAGUI.studio
        </span>
      </footer>
    </main>
  )
}
