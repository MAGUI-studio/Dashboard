export const locales = ["pt", "en"] as const
export const defaultLocale = "pt" as const

export const pathnames = {
  "/": "/",
  "/notifications": {
    pt: "/notificacoes",
    en: "/notifications",
  },
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
  "/admin/clients/[id]": {
    pt: "/admin/clientes/[id]",
    en: "/admin/clients/[id]",
  },
  "/admin/crm": {
    pt: "/admin/prospeccao",
    en: "/admin/crm",
  },
  "/admin/crm/register": {
    pt: "/admin/prospeccao/cadastrar",
    en: "/admin/crm/register",
  },
  "/admin/crm/kanban": {
    pt: "/admin/prospeccao/kanban",
    en: "/admin/crm/kanban",
  },
  "/admin/crm/list": {
    pt: "/admin/prospeccao/lista",
    en: "/admin/crm/list",
  },
  "/admin/search": {
    pt: "/admin/busca",
    en: "/admin/search",
  },
  "/admin/projects": {
    pt: "/admin/projetos",
    en: "/admin/projects",
  },
  "/admin/projects/register": {
    pt: "/admin/projetos/cadastrar",
    en: "/admin/projects/register",
  },
  "/admin/projects/[id]": {
    pt: "/admin/projetos/[id]",
    en: "/admin/projects/[id]",
  },
  "/admin/projects/[id]/assets": {
    pt: "/admin/projetos/[id]/ativos",
    en: "/admin/projects/[id]/assets",
  },
}

export type AppPathnames = keyof typeof pathnames
