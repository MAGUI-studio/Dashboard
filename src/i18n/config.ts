export const locales = ["pt", "en"] as const
export const defaultLocale = "pt" as const

export const pathnames = {
  "/": "/",
  "/admin": {
    pt: "/admin",
    en: "/admin",
  },
  "/admin/clients": {
    pt: "/admin/clientes",
    en: "/admin/clients",
  },
  "/admin/clients/register": {
    pt: "/admin/clientes/cadastrar",
    en: "/admin/clients/register",
  },
  "/admin/projects": {
    pt: "/admin/projetos",
    en: "/admin/projects",
  },
  "/admin/projects/register": {
    pt: "/admin/projetos/cadastrar",
    en: "/admin/projects/register",
  },
}

export type AppPathnames = keyof typeof pathnames
