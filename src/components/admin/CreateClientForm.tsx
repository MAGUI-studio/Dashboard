"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Button } from "@/src/components/ui/button"

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
          <label
            htmlFor="firstName"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.firstName")}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            disabled={isPending}
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="lastName"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.lastName")}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            disabled={isPending}
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.username")}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            disabled={isPending}
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            disabled={isPending}
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="role"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {t("form.role")}
          </label>
          <select
            id="role"
            name="role"
            required
            disabled={isPending}
            className="appearance-none rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none disabled:opacity-50"
          >
            <option value="client" className="bg-background">
              {t("form.roles.client")}
            </option>
            <option value="admin" className="bg-background">
              {t("form.roles.admin")}
            </option>
          </select>
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
