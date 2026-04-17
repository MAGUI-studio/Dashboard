"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import {
  CaretDown,
  CaretUp,
  CaretUpDown,
  MagnifyingGlass,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

interface UserData {
  id: string
  imageUrl: string
  firstName: string | null
  lastName: string | null
  username: string | null
  emailAddresses: { emailAddress: string }[]
  publicMetadata: { role?: string }
}

interface ClientsTableProps {
  initialUsers: UserData[]
}

type SortConfig = {
  key: "name" | "role"
  direction: "asc" | "desc" | null
}

export function ClientsTable({ initialUsers }: ClientsTableProps) {
  const t = useTranslations("Admin.clients")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortConfig>({
    key: "name",
    direction: null,
  })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 2000)
    return () => clearTimeout(timer)
  }, [search])

  const filteredUsers = React.useMemo(() => {
    let result = [...initialUsers]

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      result = result.filter(
        (user) =>
          (user.firstName?.toLowerCase() || "").includes(query) ||
          (user.lastName?.toLowerCase() || "").includes(query) ||
          user.emailAddresses.some((e) =>
            e.emailAddress.toLowerCase().includes(query)
          ) ||
          (user.username?.toLowerCase() || "").includes(query)
      )
    }

    if (sort.direction) {
      result.sort((a, b) => {
        let valA = ""
        let valB = ""

        if (sort.key === "name") {
          valA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase()
          valB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase()
        } else if (sort.key === "role") {
          valA = (a.publicMetadata.role || "client").toLowerCase()
          valB = (b.publicMetadata.role || "client").toLowerCase()
        }

        if (valA < valB) return sort.direction === "asc" ? -1 : 1
        if (valA > valB) return sort.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [initialUsers, debouncedSearch, sort])

  const handleSort = (key: "name" | "role") => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key, direction: null }
        return { key, direction: "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const getSortIcon = (key: "name" | "role") => {
    if (sort.key !== key || !sort.direction)
      return <CaretUpDown className="size-3 opacity-30" />
    return sort.direction === "asc" ? (
      <CaretUp className="size-3 text-brand-primary" />
    ) : (
      <CaretDown className="size-3 text-brand-primary" />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 group">
          <MagnifyingGlass
            weight="duotone"
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="h-14 rounded-2xl border-border/40 bg-muted/20 pl-12 pr-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/30"
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/40 bg-muted/10 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group/header"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  {t("table.profile")}
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.id")}
              </TableHead>
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group/header"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center gap-2">
                  {t("table.privileges")}
                  {getSortIcon("role")}
                </div>
              </TableHead>
              <TableHead className="px-8 h-16 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group border-border/20 transition-all hover:bg-brand-primary/[0.03]"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-11 border-2 border-background ring-2 ring-border/20 transition-all group-hover:ring-brand-primary/30">
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.firstName || "U"}
                        />
                        <AvatarFallback className="bg-muted/50 font-black text-brand-primary">
                          {user.firstName?.charAt(0) ||
                            user.emailAddresses[0]?.emailAddress
                              .charAt(0)
                              .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          @{user.username || "client"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <span className="font-sans text-xs font-bold text-muted-foreground/80">
                      {user.emailAddresses[0]?.emailAddress}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <Badge
                      variant="secondary"
                      className="bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20 text-[9px] font-black uppercase tracking-widest py-1 px-3"
                    >
                      {t(`roles.${user.publicMetadata?.role || "client"}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
                    >
                      {t("table.inspect")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/20 bg-muted/20 px-8 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t("summary", { count: filteredUsers.length })}
          </p>
        </div>
      </Card>
    </div>
  )
}
