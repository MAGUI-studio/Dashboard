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
  "/admin/crm/proposals": {
    pt: "/admin/prospeccao/propostas",
    en: "/admin/crm/proposals",
  },
  "/admin/crm/proposals/new": {
    pt: "/admin/prospeccao/propostas/nova",
    en: "/admin/crm/proposals/new",
  },
  "/admin/crm/leads/[id]": {
    pt: "/admin/prospeccao/leads/[id]",
    en: "/admin/crm/leads/[id]",
  },
  "/admin/crm/leads/[id]/proposal": {
    pt: "/admin/prospeccao/leads/[id]/proposta",
    en: "/admin/crm/leads/[id]/proposal",
  },
  "/admin/crm/leads/[id]/proposals": {
    pt: "/admin/prospeccao/leads/[id]/propostas",
    en: "/admin/crm/leads/[id]/proposals",
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
  "/admin/documents": {
    pt: "/admin/documentos",
    en: "/admin/documents",
  },
  "/admin/documents/new": {
    pt: "/admin/documentos/novo",
    en: "/admin/documents/new",
  },
  "/admin/documents/[id]": {
    pt: "/admin/documentos/[id]",
    en: "/admin/documents/[id]",
  },
  "/admin/documents/[id]/edit": {
    pt: "/admin/documentos/[id]/editar",
    en: "/admin/documents/[id]/edit",
  },
  "/projects": {
    pt: "/projetos",
    en: "/projects",
  },
  "/projects/[id]": {
    pt: "/projetos/[id]",
    en: "/projects/[id]",
  },
  "/projects/[id]/timeline": {
    pt: "/projetos/[id]/timeline",
    en: "/projects/[id]/timeline",
  },
  "/projects/[id]/approvals": {
    pt: "/projetos/[id]/validacoes",
    en: "/projects/[id]/approvals",
  },
  "/projects/[id]/files": {
    pt: "/projetos/[id]/arquivos",
    en: "/projects/[id]/files",
  },
  "/projects/[id]/briefing": {
    pt: "/projetos/[id]/briefing",
    en: "/projects/[id]/briefing",
  },
  "/projects/[id]/tasks": {
    pt: "/projetos/[id]/tarefas",
    en: "/projects/[id]/tasks",
  },
  "/projects/[id]/communication": {
    pt: "/projetos/[id]/comunicacao",
    en: "/projects/[id]/communication",
  },
  "/projects/[id]/financial": {
    pt: "/projetos/[id]/investimento",
    en: "/projects/[id]/financial",
  },
  "/notifications": {
    pt: "/notificacoes",
    en: "/notifications",
  },
  "/docs": {
    pt: "/docs",
    en: "/docs",
  },
  "/docs/[...slug]": {
    pt: "/docs/[...slug]",
    en: "/docs/[...slug]",
  },
  "/docs/changelog": {
    pt: "/docs/changelog",
    en: "/docs/changelog",
  },
}

export type AppPathnames = keyof typeof pathnames
