import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(value: string | number): string {
  const amount =
    typeof value === "string" ? Number(value.replace(/\D/g, "")) / 100 : value

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)
}

export function formatLocalTime(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    })

    const formatted = formatter.format(date)

    // Friendly timezone display
    // America/Sao_Paulo -> Sao Paulo
    const friendlyTz = timezone.includes("/")
      ? timezone.split("/").pop()?.replace(/_/g, " ")
      : timezone

    return `${formatted} (${friendlyTz})`
  } catch (error) {
    console.error("Format error for timezone:", timezone, error)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
}
