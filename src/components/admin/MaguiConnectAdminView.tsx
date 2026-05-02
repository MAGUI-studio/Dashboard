"use client"

import { useMemo, useState, useTransition } from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { MaguiConnectProfile } from "@/src/generated/client"
import { CaretDown, PencilSimple, Plus, Trash } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import {
  createMaguiConnectLinkForUserAction,
  createMaguiConnectProfileForUserAction,
  deleteMaguiConnectLinkForUserAction,
  updateMaguiConnectLinkForUserAction,
  upsertMaguiConnectProfileForUserAction,
} from "@/src/lib/actions/maguiConnect.actions"
import {
  type MaguiConnectLinkInput,
  type MaguiConnectProfileInput,
  maguiConnectLinkSchema,
  maguiConnectProfileSchema,
} from "@/src/lib/validations/maguiConnect"

interface MaguiConnectAdminViewProps {
  clientName: string
  userId: string
  profile:
    | (MaguiConnectProfile & {
        links: Array<{ id: string; label: string; url: string }>
      })
    | null
}

export function MaguiConnectAdminView({
  clientName,
  userId,
  profile,
}: MaguiConnectAdminViewProps) {
  const t = useTranslations("MaguiConnect")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<MaguiConnectProfileInput>({
    title: profile?.displayName ?? clientName,
    description: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    ogImageUrl: profile?.ogImageUrl ?? "",
    slug: profile?.slug ?? "",
    domain: profile?.domain ?? "",
    professionalCategory: profile?.professionalCategory ?? "",
    location: profile?.location ?? "",
    companyName: profile?.companyName ?? "",
    publicEmail: profile?.publicEmail ?? "",
    publicPhone: profile?.publicPhone ?? "",
    whatsapp: profile?.whatsapp ?? "",
    primaryCtaLabel: profile?.primaryCtaLabel ?? "",
    primaryCtaUrl: profile?.primaryCtaUrl ?? "",
    themeAccent: profile?.themeAccent ?? "",
    themeBackground: profile?.themeBackground ?? "#0a0a0a",
    themeForeground: profile?.themeForeground ?? "#f5f5f5",
    seoTitle: profile?.seoTitle ?? "",
    seoDescription: profile?.seoDescription ?? "",
  })
  const [newLink, setNewLink] = useState<MaguiConnectLinkInput>({
    label: "",
    url: "",
    kind: "LINK",
    isFeatured: false,
    openInNewTab: true,
  })
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editingLinkData, setEditingLinkData] = useState<MaguiConnectLinkInput>(
    {
      label: "",
      url: "",
      kind: "LINK",
      isFeatured: false,
      openInNewTab: true,
    }
  )

  const links = useMemo(() => profile?.links ?? [], [profile?.links])

  if (!profile) {
    return (
      <section className="border-t border-border/40 pt-6">
        <div className="rounded-[2rem] border border-border/30 bg-muted/10 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-40 flex-shrink-0">
                <Image
                  src="/logos/connect/connect_DM.svg"
                  alt="Magui Connect"
                  fill
                  className="object-contain object-left dark:hidden"
                />
                <Image
                  src="/logos/connect/connect_LM.svg"
                  alt="Magui Connect"
                  fill
                  className="hidden object-contain object-left dark:block"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {clientName}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminCreateDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-muted-foreground">{t("adminEmpty")}</p>
              <Button
                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await createMaguiConnectProfileForUserAction(userId)
                      toast.success(t("adminCreateSuccess"))
                      router.refresh()
                    } catch (error) {
                      console.error(error)
                      toast.error(t("adminCreateError"))
                    }
                  })
                }
              >
                <Plus size={16} className="mr-2" weight="bold" />
                {t("adminCreateButton")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-border/40 pt-6">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="rounded-[2rem] border border-border/30 bg-muted/10 backdrop-blur-md"
      >
        <CollapsibleTrigger asChild>
          <button
            className="flex w-full items-center justify-between gap-6 p-6 text-left transition-colors hover:bg-background/30"
            type="button"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-12 w-40 flex-shrink-0">
                <Image
                  src="/logos/connect/connect_DM.svg"
                  alt="Magui Connect"
                  fill
                  className="object-contain object-left dark:hidden"
                />
                <Image
                  src="/logos/connect/connect_LM.svg"
                  alt="Magui Connect"
                  fill
                  className="hidden object-contain object-left dark:block"
                />
              </div>

              <div className="min-w-0 space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {formData.title || clientName}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                {links.length} {links.length === 1 ? "link" : "links"}
              </div>
              <span
                className={`rounded-full border border-border/40 p-2 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <CaretDown size={16} weight="bold" />
              </span>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-border/20 px-6 pb-6">
          <div className="space-y-10 pt-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("registerTitle")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("registerDescription")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-title"
                  >
                    {t("titleLabel")}
                  </Label>
                  <Input
                    aria-label={t("titleLabel")}
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-title"
                    placeholder={t("titlePlaceholder")}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      htmlFor="admin-magui-slug"
                    >
                      {t("slugLabel")}
                    </Label>
                    <Input
                      aria-label={t("slugLabel")}
                      className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                      id="admin-magui-slug"
                      placeholder={t("slugPlaceholder")}
                      value={formData.slug ?? ""}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          slug: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      htmlFor="admin-magui-domain"
                    >
                      {t("domainLabel")}
                    </Label>
                    <Input
                      aria-label={t("domainLabel")}
                      className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                      id="admin-magui-domain"
                      placeholder={t("domainPlaceholder")}
                      value={formData.domain ?? ""}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          domain: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-description"
                  >
                    {t("descriptionLabel")}
                  </Label>
                  <Textarea
                    aria-label={t("descriptionLabel")}
                    className="min-h-32 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-description"
                    placeholder={t("descriptionPlaceholder")}
                    value={formData.description ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("adminSlugDomainHelper")}
                </p>
              </div>

              <div className="flex justify-start">
                <Button
                  className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        const parsed = maguiConnectProfileSchema.parse(formData)
                        await upsertMaguiConnectProfileForUserAction(
                          userId,
                          parsed
                        )
                        toast.success(t("adminUpdateSuccess"))
                        router.refresh()
                      } catch (error) {
                        console.error(error)
                        toast.error(
                          error instanceof Error && error.message
                            ? error.message
                            : t("adminUpdateError")
                        )
                      }
                    })
                  }
                >
                  {t("save")}
                </Button>
              </div>
            </section>

            <section className="space-y-5 border-t border-border/20 pt-8">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("linksTitle")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminLinksDescription")}
                </p>
              </div>

              <div className="grid gap-3 border-b border-border/30 pb-5">
                <Input
                  className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                  placeholder={t("linkLabel")}
                  value={newLink.label}
                  onChange={(e) =>
                    setNewLink((current) => ({
                      ...current,
                      label: e.target.value,
                    }))
                  }
                />
                <Input
                  className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                  placeholder={t("linkUrl")}
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((current) => ({
                      ...current,
                      url: e.target.value,
                    }))
                  }
                />
                <div className="flex justify-start">
                  <Button
                    className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          const parsed = maguiConnectLinkSchema.parse(newLink)
                          await createMaguiConnectLinkForUserAction(
                            userId,
                            parsed
                          )
                          setNewLink({
                            label: "",
                            url: "",
                            kind: "LINK",
                            isFeatured: false,
                            openInNewTab: true,
                          })
                          toast.success(t("adminLinkCreateSuccess"))
                          router.refresh()
                        } catch (error) {
                          console.error(error)
                          toast.error(t("adminLinkCreateError"))
                        }
                      })
                    }
                  >
                    <Plus size={16} className="mr-2" weight="bold" />
                    {t("addLink")}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {links.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("adminNoLinks")}
                  </p>
                ) : (
                  links.map((link, index) => {
                    const isEditing = editingLinkId === link.id

                    return (
                      <div
                        key={link.id}
                        className="space-y-3 border-b border-border/30 pb-4 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Link {index + 1}
                            </p>
                          </div>

                          {!isEditing ? (
                            <div className="flex items-center gap-1">
                              <Button
                                className="h-9 rounded-full px-3"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingLinkId(link.id)
                                  setEditingLinkData({
                                    label: link.label,
                                    url: link.url,
                                    kind: link.kind ?? "LINK",
                                    isFeatured: link.isFeatured ?? false,
                                    openInNewTab: link.openInNewTab ?? true,
                                  })
                                }}
                              >
                                <PencilSimple size={14} />
                              </Button>
                              <Button
                                className="h-9 rounded-full px-3"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startTransition(async () => {
                                    try {
                                      await deleteMaguiConnectLinkForUserAction(
                                        userId,
                                        link.id
                                      )
                                      toast.success(t("adminLinkDeleteSuccess"))
                                      router.refresh()
                                    } catch (error) {
                                      console.error(error)
                                      toast.error(t("adminLinkDeleteError"))
                                    }
                                  })
                                }
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                              value={editingLinkData.label}
                              onChange={(e) =>
                                setEditingLinkData((current) => ({
                                  ...current,
                                  label: e.target.value,
                                }))
                              }
                            />
                            <Input
                              className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                              value={editingLinkData.url}
                              onChange={(e) =>
                                setEditingLinkData((current) => ({
                                  ...current,
                                  url: e.target.value,
                                }))
                              }
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                                disabled={isPending}
                                onClick={() =>
                                  startTransition(async () => {
                                    try {
                                      const parsed =
                                        maguiConnectLinkSchema.parse(
                                          editingLinkData
                                        )
                                      await updateMaguiConnectLinkForUserAction(
                                        userId,
                                        link.id,
                                        parsed
                                      )
                                      setEditingLinkId(null)
                                      toast.success(t("adminLinkUpdateSuccess"))
                                      router.refresh()
                                    } catch (error) {
                                      console.error(error)
                                      toast.error(t("adminLinkUpdateError"))
                                    }
                                  })
                                }
                              >
                                {t("save")}
                              </Button>
                              <Button
                                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                                variant="ghost"
                                onClick={() => setEditingLinkId(null)}
                              >
                                {t("cancel")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-base font-medium text-foreground">
                              {link.label}
                            </p>
                            <p className="break-all text-sm text-muted-foreground">
                              {link.url}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
