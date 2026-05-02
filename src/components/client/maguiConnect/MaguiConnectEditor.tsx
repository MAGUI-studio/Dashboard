"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"

import { MaguiConnectProfile } from "@/src/generated/client"
import {
  ArrowRight,
  Camera,
  Check,
  Globe,
  IdentificationCard,
  Palette,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"

import { upsertOwnMaguiConnectProfileAction } from "@/src/lib/actions/maguiConnect.actions"
import { UploadButton } from "@/src/lib/uploadthing"
import { cn } from "@/src/lib/utils/utils"
import {
  type MaguiConnectProfileInput,
  maguiConnectProfileSchema,
} from "@/src/lib/validations/maguiConnect"

interface MaguiConnectEditorProps {
  initialProfile: MaguiConnectProfile | null
}

const editorTabs = [
  {
    value: "basic",
    icon: IdentificationCard,
    index: "01",
  },
  {
    value: "contact",
    icon: Globe,
    index: "02",
  },
  {
    value: "appearance",
    icon: Palette,
    index: "03",
  },
  {
    value: "seo",
    icon: Check,
    index: "04",
  },
] as const

export function MaguiConnectEditor({
  initialProfile,
}: MaguiConnectEditorProps) {
  const t = useTranslations("MaguiConnect")
  const [isPending, startTransition] = React.useTransition()

  const [formData, setFormData] = React.useState<MaguiConnectProfileInput>({
    status: initialProfile?.status ?? "DRAFT",
    title: initialProfile?.displayName ?? "",
    description: initialProfile?.headline ?? "",
    bio: initialProfile?.bio ?? "",
    avatarUrl: initialProfile?.avatarUrl ?? "",
    ogImageUrl: initialProfile?.ogImageUrl ?? "",
    slug: initialProfile?.slug ?? "",
    domain: initialProfile?.domain ?? "",
    professionalCategory: initialProfile?.professionalCategory ?? "",
    location: initialProfile?.location ?? "",
    companyName: initialProfile?.companyName ?? "",
    publicEmail: initialProfile?.publicEmail ?? "",
    publicPhone: initialProfile?.publicPhone ?? "",
    whatsapp: initialProfile?.whatsapp ?? "",
    primaryCtaLabel: initialProfile?.primaryCtaLabel ?? "",
    primaryCtaUrl: initialProfile?.primaryCtaUrl ?? "",
    themeAccent: initialProfile?.themeAccent ?? "#E5FF00",
    themeBackground: initialProfile?.themeBackground ?? "#0a0a0a",
    themeForeground: initialProfile?.themeForeground ?? "#f5f5f5",
    seoTitle: initialProfile?.seoTitle ?? "",
    seoDescription: initialProfile?.seoDescription ?? "",
  })

  // Sync avatar immediately when uploaded
  const handleAvatarUpload = async (url: string) => {
    const updatedData = { ...formData, avatarUrl: url }
    setFormData(updatedData)

    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(updatedData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error("Erro ao salvar foto de perfil")
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(formData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : t("updateFailed")
        )
      }
    })
  }

  const updateField = (
    field: keyof MaguiConnectProfileInput,
    value: string | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="w-full">
      <Tabs defaultValue="basic" className="w-full">
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-brand-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/55">
              {t("registerEyebrow")}
            </p>
          </div>

          <div>
            <TabsList className="grid grid-cols-2 gap-2 rounded-[1.75rem] border border-border/30 bg-muted/10 p-2 backdrop-blur-md sm:grid-cols-4">
              {editorTabs.map((tab) => {
                const Icon = tab.icon
                const labelKey =
                  tab.value === "basic"
                    ? "tabBasic"
                    : tab.value === "contact"
                      ? "tabContact"
                      : tab.value === "appearance"
                        ? "tabAppearance"
                        : "tabSEO"

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "group min-h-20 rounded-[1.15rem] border border-transparent bg-transparent px-4 py-4 text-left shadow-none transition-all duration-200",
                      "data-[state=active]:border-foreground/10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]"
                    )}
                  >
                    <div className="flex w-full items-start gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/60 text-foreground/75 transition-colors group-data-[state=active]:border-brand-primary/30 group-data-[state=active]:bg-brand-primary/10 group-data-[state=active]:text-brand-primary">
                        <Icon size={18} weight="bold" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/55 group-data-[state=active]:text-brand-primary/65">
                          {tab.index}
                        </p>
                        <p className="text-sm font-black tracking-tight text-foreground/75 group-data-[state=active]:text-foreground">
                          {t(labelKey)}
                        </p>
                      </div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </div>

        {/* --- BASIC INFO --- */}
        <TabsContent
          value="basic"
          className="mt-0 rounded-[2rem] border border-border/30 bg-background/35 p-6 animate-in fade-in duration-500 md:p-8"
        >
          <div className="mb-8 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary/60">
              {t("tabBasic")}
            </p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("registerDescription")}
            </p>
          </div>

          <div className="grid gap-10">
            <div className="grid gap-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                {t("statusLabel")}
              </Label>
              <div className="grid gap-4 sm:grid-cols-3">
                {(["DRAFT", "PUBLISHED", "PAUSED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateField("status", s)}
                    className={cn(
                      "flex flex-col gap-2 rounded-2xl border border-border/30 bg-muted/5 p-4 text-left transition-all hover:bg-muted/10",
                      formData.status === s &&
                        "border-brand-primary/40 bg-brand-primary/5 ring-1 ring-brand-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-black uppercase tracking-wider",
                          formData.status === s
                            ? "text-brand-primary"
                            : "text-foreground/70"
                        )}
                      >
                        {t(`status${s}`)}
                      </span>
                      {formData.status === s && (
                        <Check
                          size={14}
                          weight="bold"
                          className="text-brand-primary"
                        />
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground/60">
                      {t(`status${s}Desc`)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                htmlFor="title"
              >
                {t("titleLabel")}
              </Label>
              <Input
                id="title"
                className="h-14 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-2xl font-bold shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground focus-visible:ring-0 transition-all"
                placeholder={t("titlePlaceholder")}
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                htmlFor="description"
              >
                {t("descriptionLabel")}
              </Label>
              <Input
                id="description"
                className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-lg shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground focus-visible:ring-0 transition-all"
                placeholder={t("descriptionPlaceholder")}
                value={formData.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                htmlFor="bio"
              >
                {t("bioLabel")}
              </Label>
              <Textarea
                id="bio"
                className="min-h-[100px] rounded-none border-0 border-b border-border/60 bg-transparent px-0 py-2 text-base leading-relaxed shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground focus-visible:ring-0 transition-all resize-none"
                placeholder={t("bioPlaceholder")}
                value={formData.bio ?? ""}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
              <div className="grid gap-3">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                  htmlFor="professionalCategory"
                >
                  {t("categoryLabel")}
                </Label>
                <Input
                  id="professionalCategory"
                  className="h-10 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground transition-all"
                  placeholder={t("categoryPlaceholder")}
                  value={formData.professionalCategory ?? ""}
                  onChange={(e) =>
                    updateField("professionalCategory", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                  htmlFor="location"
                >
                  {t("locationLabel")}
                </Label>
                <Input
                  id="location"
                  className="h-10 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground transition-all"
                  placeholder={t("locationPlaceholder")}
                  value={formData.location ?? ""}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- CONTACT & CTA --- */}
        <TabsContent
          value="contact"
          className="mt-0 rounded-[2rem] border border-border/30 bg-background/35 p-6 animate-in fade-in duration-500 md:p-8"
        >
          <div className="mb-8 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary/60">
              {t("tabContact")}
            </p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("linksDescription")}
            </p>
          </div>

          <div className="grid gap-10">
            <div className="grid gap-10 sm:grid-cols-2">
              <div className="grid gap-3">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                  htmlFor="publicEmail"
                >
                  {t("emailLabel")}
                </Label>
                <Input
                  id="publicEmail"
                  type="email"
                  className="h-10 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none focus-visible:border-foreground transition-all"
                  placeholder="contato@exemplo.com"
                  value={formData.publicEmail ?? ""}
                  onChange={(e) => updateField("publicEmail", e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                  htmlFor="whatsapp"
                >
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  className="h-10 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none focus-visible:border-foreground transition-all"
                  placeholder="+55 11 99999-9999"
                  value={formData.whatsapp ?? ""}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground">
                  {t("ctaSection")}
                </span>
                <div className="h-[1px] flex-1 bg-border/40" />
              </div>
              <div className="grid gap-10 sm:grid-cols-2">
                <div className="grid gap-3">
                  <Label
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    htmlFor="primaryCtaLabel"
                  >
                    {t("ctaLabel")}
                  </Label>
                  <Input
                    id="primaryCtaLabel"
                    className="h-10 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none focus-visible:border-foreground transition-all"
                    placeholder="Ex: Agendar Consultoria"
                    value={formData.primaryCtaLabel ?? ""}
                    onChange={(e) =>
                      updateField("primaryCtaLabel", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-3">
                  <Label
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    htmlFor="primaryCtaUrl"
                  >
                    {t("ctaUrl")}
                  </Label>
                  <Input
                    id="primaryCtaUrl"
                    className="h-10 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm font-mono shadow-none focus-visible:border-foreground transition-all"
                    placeholder="https://..."
                    value={formData.primaryCtaUrl ?? ""}
                    onChange={(e) =>
                      updateField("primaryCtaUrl", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- APPEARANCE & CUSTOMIZATION --- */}
        <TabsContent
          value="appearance"
          className="mt-0 rounded-[2rem] border border-border/30 bg-background/35 p-6 animate-in fade-in duration-500 md:p-8"
        >
          <div className="mb-8 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary/60">
              {t("tabAppearance")}
            </p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("adminDescription")}
            </p>
          </div>

          <div className="grid gap-12">
            {/* Avatar Section */}
            <div className="rounded-[1.5rem] border border-border/30 bg-muted/10 p-6">
              <div className="flex flex-col items-center gap-10 sm:flex-row">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border border-border/40 overflow-hidden bg-muted/5 flex items-center justify-center transition-all group-hover:border-brand-primary/20 shadow-2xl shadow-black/40">
                    {formData.avatarUrl ? (
                      <Image
                        src={formData.avatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Camera
                        size={32}
                        weight="thin"
                        className="text-muted-foreground/20"
                      />
                    )}
                  </div>
                  {formData.avatarUrl && (
                    <button
                      onClick={() => handleAvatarUpload("")}
                      className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-background border border-border/40 text-destructive flex items-center justify-center shadow-xl transition-all active:scale-90 hover:bg-destructive hover:text-white"
                      title="Remover Foto"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em]">
                      {t("avatarLabel")}
                    </h4>
                    <p className="text-[10px] text-muted-foreground/40 leading-relaxed font-medium">
                      {t("avatarDescription")}
                    </p>
                  </div>
                  <UploadButton
                    endpoint="maguiConnectAvatar"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        handleAvatarUpload(res[0].url)
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Erro: ${error.message}`)
                    }}
                    appearance={{
                      button:
                        "ut-ready:bg-foreground ut-uploading:bg-muted/40 ut-uploading:cursor-not-allowed rounded-full h-10 px-8 text-[9px] font-black uppercase tracking-[0.25em] text-background transition-all active:scale-95 after:bg-brand-primary",
                      allowedContent: "hidden",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return "Enviando..."
                        if (ready)
                          return formData.avatarUrl
                            ? t("changeAvatar")
                            : t("uploadAvatar")
                        return "Carregando..."
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Color Pickers Section */}
            <div className="grid gap-6 rounded-[1.5rem] border border-border/30 bg-muted/10 p-6 sm:grid-cols-3">
              <div className="space-y-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60 block"
                  htmlFor="themeAccent"
                >
                  {t("accentLabel")}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border/40 shadow-lg">
                    <input
                      type="color"
                      id="themeAccent"
                      value={formData.themeAccent || "#E5FF00"}
                      onChange={(e) =>
                        updateField("themeAccent", e.target.value)
                      }
                      className="absolute inset-[-20%] h-[140%] w-[140%] cursor-pointer"
                    />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {formData.themeAccent}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60 block"
                  htmlFor="themeBackground"
                >
                  {t("bgLabel")}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border/40 shadow-lg">
                    <input
                      type="color"
                      id="themeBackground"
                      value={formData.themeBackground || "#0a0a0a"}
                      onChange={(e) =>
                        updateField("themeBackground", e.target.value)
                      }
                      className="absolute inset-[-20%] h-[140%] w-[140%] cursor-pointer"
                    />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {formData.themeBackground}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60 block"
                  htmlFor="themeForeground"
                >
                  {t("fgLabel")}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border/40 shadow-lg">
                    <input
                      type="color"
                      id="themeForeground"
                      value={formData.themeForeground || "#f5f5f5"}
                      onChange={(e) =>
                        updateField("themeForeground", e.target.value)
                      }
                      className="absolute inset-[-20%] h-[140%] w-[140%] cursor-pointer"
                    />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {formData.themeForeground}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- SEO --- */}
        <TabsContent
          value="seo"
          className="mt-0 rounded-[2rem] border border-border/30 bg-background/35 p-6 animate-in fade-in duration-500 md:p-8"
        >
          <div className="mb-8 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary/60">
              {t("tabSEO")}
            </p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("seoDescriptionPlaceholder")}
            </p>
          </div>

          <div className="grid gap-10">
            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                htmlFor="seoTitle"
              >
                {t("seoTitleLabel")}
              </Label>
              <Input
                id="seoTitle"
                className="h-14 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-lg font-bold shadow-none focus-visible:border-foreground transition-all"
                placeholder={t("seoTitlePlaceholder")}
                value={formData.seoTitle ?? ""}
                onChange={(e) => updateField("seoTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60"
                htmlFor="seoDescription"
              >
                {t("seoDescriptionLabel")}
              </Label>
              <Textarea
                id="seoDescription"
                className="min-h-[100px] rounded-none border-0 border-b border-border/60 bg-transparent px-0 py-2 text-base leading-relaxed shadow-none placeholder:text-muted-foreground/20 focus-visible:border-foreground transition-all resize-none"
                placeholder={t("seoDescriptionPlaceholder")}
                value={formData.seoDescription ?? ""}
                onChange={(e) => updateField("seoDescription", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-10 mt-6 border-t border-border/40">
        <Button
          className="group relative cursor-pointer rounded-full bg-brand-primary px-10 h-14 text-[11px] font-black uppercase tracking-[0.4em] text-white hover:bg-brand-primary transition-all active:scale-[0.98] shadow-2xl shadow-brand-primary/20 overflow-hidden"
          disabled={isPending}
          onClick={handleSave}
        >
          <div className="relative z-10 flex items-center gap-3">
            {isPending ? t("saving") : t("save")}
            {!isPending && (
              <ArrowRight
                size={18}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>
    </section>
  )
}
