type HeaderStaticPath =
  | "/"
  | "/admin/clients"
  | "/admin/clients/register"
  | "/admin/crm"
  | "/admin/crm/register"
  | "/admin/crm/proposals"
  | "/admin/crm/proposals/new"
  | "/admin/projects"
  | "/admin/projects/register"
  | "/admin/service-categories"
  | "/admin/service-categories/new"
  | "/projects"

export type HeaderNavLeaf = {
  href: HeaderStaticPath
  icon:
    | "dashboard"
    | "home"
    | "list"
    | "plus"
    | "projects"
    | "clients"
    | "crm"
    | "tag"
  label: string
  matchPrefix?: HeaderStaticPath
  exact?: boolean
}

export type HeaderNavGroup = {
  icon: "crm" | "projects" | "clients"
  label: string
  items: HeaderNavLeaf[]
}

export function getAdminHeaderNav(t: (key: string) => string): {
  dashboard: HeaderNavLeaf
  groups: HeaderNavGroup[]
} {
  return {
    dashboard: {
      href: "/",
      icon: "dashboard",
      label: t("dashboard"),
      exact: true,
    },
    groups: [
      {
        icon: "crm",
        label: t("commercial.title"),
        items: [
          {
            href: "/admin/crm",
            icon: "list",
            label: t("commercial.list"),
            matchPrefix: "/admin/crm",
          },
          {
            href: "/admin/crm/register",
            icon: "plus",
            label: t("commercial.create"),
            exact: true,
          },
          {
            href: "/admin/crm/proposals",
            icon: "list",
            label: t("commercial.proposals"),
            matchPrefix: "/admin/crm/proposals",
          },
          {
            href: "/admin/crm/proposals/new",
            icon: "plus",
            label: t("commercial.proposal_create"),
            exact: true,
          },
        ],
      },
      {
        icon: "projects",
        label: t("projects.title"),
        items: [
          {
            href: "/admin/projects",
            icon: "list",
            label: t("projects.list"),
            matchPrefix: "/admin/projects",
          },
          {
            href: "/admin/projects/register",
            icon: "plus",
            label: t("projects.create"),
            exact: true,
          },
          {
            href: "/admin/service-categories",
            icon: "tag",
            label: t("projects.categories_all"),
            matchPrefix: "/admin/service-categories",
          },
          {
            href: "/admin/service-categories/new",
            icon: "plus",
            label: t("projects.categories_new"),
            exact: true,
          },
        ],
      },
      {
        icon: "clients",
        label: t("clients.title"),
        items: [
          {
            href: "/admin/clients",
            icon: "list",
            label: t("clients.list"),
            matchPrefix: "/admin/clients",
          },
          {
            href: "/admin/clients/register",
            icon: "plus",
            label: t("clients.create"),
            exact: true,
          },
        ],
      },
    ],
  }
}

export function getClientHeaderNav(
  t: (key: string) => string
): HeaderNavLeaf[] {
  return [
    {
      href: "/",
      icon: "home",
      label: t("client.home"),
      exact: true,
    },
    {
      href: "/projects",
      icon: "projects",
      label: t("client.projects"),
      matchPrefix: "/projects",
    },
  ]
}

export function isNavItemActive(
  pathname: string,
  item: Pick<HeaderNavLeaf, "href" | "matchPrefix" | "exact">
) {
  if (item.exact) {
    return pathname === item.href
  }

  if (item.matchPrefix) {
    return pathname.startsWith(item.matchPrefix)
  }

  return pathname.startsWith(item.href)
}
