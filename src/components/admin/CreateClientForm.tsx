"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Button } from "@/src/components/ui/button"

import { createClientAction } from "@/src/lib/actions/user.actions"

export function CreateClientForm() {
  const t = useTranslations("Admin.clients")
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)

    try {
      const result = await createClientAction(formData)

      if (result?.error) {
        if (typeof result.error === "string") {
          setError(result.error)
        } else {
          setError("Invalid fields")
        }
      } else if (result?.success) {
        router.push("/admin/clients")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
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
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none"
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
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none"
          />
        </div>
      </div>

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
          className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none"
        />
      </div>

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
          className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-bold text-foreground focus:border-brand-primary focus:outline-none"
        />
      </div>

      {error && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full py-6 text-xs uppercase tracking-[0.2em]"
      >
        {pending ? "Creating..." : t("form.submit")}
      </Button>
    </form>
  )
}
