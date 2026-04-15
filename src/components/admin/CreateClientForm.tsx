"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { createClientAction } from "@/src/lib/actions/user.actions"

export function CreateClientForm() {
  const t = useTranslations("Admin.clients")
  const router = useRouter()

  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await createClientAction(formData)
      if (result.success) {
        router.push("/admin/clients")
        return { success: true, error: null }
      }
      return { success: false, error: result.error }
    },
    { success: false, error: null }
  )

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="firstName"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.firstName")}
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            required
            disabled={isPending}
            className="rounded-xl border-border/60 bg-muted/20 px-4 h-12 text-sm font-bold text-foreground focus-visible:ring-brand-primary disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="lastName"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.lastName")}
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            required
            disabled={isPending}
            className="rounded-xl border-border/60 bg-muted/20 px-4 h-12 text-sm font-bold text-foreground focus-visible:ring-brand-primary disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            className="rounded-xl border-border/60 bg-muted/20 px-4 h-12 text-sm font-bold text-foreground focus-visible:ring-brand-primary disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="username"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.username")}
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            disabled={isPending}
            className="rounded-xl border-border/60 bg-muted/20 px-4 h-12 text-sm font-bold text-foreground focus-visible:ring-brand-primary disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            disabled={isPending}
            className="rounded-xl border-border/60 bg-muted/20 px-4 h-12 text-sm font-bold text-foreground focus-visible:ring-brand-primary disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="role"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.role")}
          </Label>
          <Select
            name="role"
            defaultValue="client"
            required
            disabled={isPending}
          >
            <SelectTrigger
              id="role"
              className="rounded-xl border-border/60 bg-muted/20 px-4 h-12 text-sm font-bold text-foreground focus:ring-brand-primary disabled:opacity-50"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60 bg-muted/90 backdrop-blur-md">
              <SelectItem
                value="client"
                className="text-xs font-bold uppercase tracking-widest focus:bg-brand-primary focus:text-white"
              >
                {t("form.roles.client")}
              </SelectItem>
              <SelectItem
                value="admin"
                className="text-xs font-bold uppercase tracking-widest focus:bg-brand-primary focus:text-white"
              >
                {t("form.roles.admin")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.error && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">
          {typeof state.error === "string"
            ? state.error
            : "Check the fields and try again"}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full py-6 text-xs uppercase tracking-[0.2em]"
      >
        {isPending ? "Creating..." : t("form.submit")}
      </Button>
    </form>
  )
}
