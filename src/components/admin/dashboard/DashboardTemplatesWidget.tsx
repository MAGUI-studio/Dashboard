import * as React from "react"

import { getTranslations } from "next-intl/server"

import { MessageTemplate } from "@/src/types/crm"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { AdminTemplateLibrary } from "@/src/components/admin/AdminTemplateLibrary"

import { getMessageTemplates } from "@/src/lib/crm-data"

export async function DashboardTemplatesWidget() {
  const t = await getTranslations("Dashboard")
  const templates = await getMessageTemplates()

  return (
    <section className="grid gap-6">
      <Card className="rounded-[2rem] border-border/40 bg-muted/10 backdrop-blur-md">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
            {t("template_library.title")}
          </CardTitle>
          <CardDescription>{t("template_library.description")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AdminTemplateLibrary templates={templates as MessageTemplate[]} />
        </CardContent>
      </Card>
    </section>
  )
}
