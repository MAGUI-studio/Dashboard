"use client"

import { useMemo, useState, useTransition } from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { MaguiConnectProfile } from "@/src/generated/client"
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
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
  const [formData, setFormData] = useState<MaguiConnectProfileInput>({
    title: profile?.displayName ?? clientName,
    description: profile?.headline ?? "",
  })
  const [newLink, setNewLink] = useState<MaguiConnectLinkInput>({
    label: "",
    url: "",
  })
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editingLinkData, setEditingLinkData] = useState<MaguiConnectLinkInput>(
    {
      label: "",
      url: "",
    }
  )

  const links = useMemo(() => profile?.links ?? [], [profile?.links])

  if (!profile) {
    return (
      <section className="space-y-6 border-t border-border/40 pt-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            MAGUI Connect
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {clientName}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("adminCreateDescription")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-border/30 pb-6">
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
      </section>
    )
  }

  return (
    <section className="space-y-8 border-t border-border/40 pt-6">
      <div className="flex flex-col gap-3 border-b border-border/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            MAGUI Connect
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {formData.title || clientName}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("adminDescription")}
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          {links.length} {links.length === 1 ? "link" : "links"}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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

          <div className="flex justify-start">
            <Button
              className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    const parsed = maguiConnectProfileSchema.parse(formData)
                    await upsertMaguiConnectProfileForUserAction(userId, parsed)
                    toast.success(t("adminUpdateSuccess"))
                    router.refresh()
                  } catch (error) {
                    console.error(error)
                    toast.error(t("adminUpdateError"))
                  }
                })
              }
            >
              {t("save")}
            </Button>
          </div>
        </section>

        <section className="space-y-5">
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
                setNewLink((current) => ({ ...current, label: e.target.value }))
              }
            />
            <Input
              className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
              placeholder={t("linkUrl")}
              value={newLink.url}
              onChange={(e) =>
                setNewLink((current) => ({ ...current, url: e.target.value }))
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
                      await createMaguiConnectLinkForUserAction(userId, parsed)
                      setNewLink({ label: "", url: "" })
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
    </section>
  )
}
