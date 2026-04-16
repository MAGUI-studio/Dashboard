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
    const tz = timezone || "America/Sao_Paulo"

    // Formatter para as partes da data/hora
    const parts = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(date)

    const getPart = (type: string) =>
      parts.find((p) => p.type === type)?.value || ""

    const day = getPart("day")
    const month = getPart("month")
    const year = getPart("year")
    const hour = getPart("hour")
    const minute = getPart("minute")
    const gmt = getPart("timeZoneName") // Retorna "GMT-3", "GMT+1", etc.

    return `${day}/${month}/${year}, ${hour}:${minute} (${gmt})`
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
