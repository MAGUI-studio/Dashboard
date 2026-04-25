"use client"

import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import {
  Briefcase,
  DotsThreeVertical,
  Eye,
  FileText,
  Pencil,
  Trash,
  User,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { cn } from "@/src/lib/utils/utils"

interface DocumentsTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: any[]
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const statusColors = {
    DRAFT: "bg-muted/50 text-muted-foreground border-border/40",
    SENT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    VIEWED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    SIGNED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    COMPLETED: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
    EXPIRED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
        <FileText className="size-20 mb-6" />
        <p className="font-heading text-2xl font-black uppercase tracking-tight">
          Nenhum documento encontrado
        </p>
        <p className="text-sm font-medium mt-2">
          Inicie um novo contrato ou NDA para vê-lo aqui.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/40 hover:bg-transparent">
          <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Tipo
          </TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Documento
          </TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Vínculo
          </TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Status
          </TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 text-right">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow
            key={doc.id}
            className="group border-border/40 transition-all hover:bg-muted/5"
          >
            <TableCell>
              <Badge
                variant="outline"
                className="rounded-full border-border/40 bg-muted/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
              >
                {doc.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground transition-colors group-hover:text-brand-primary">
                  {doc.title}
                </span>
                <span className="text-[9px] font-medium text-muted-foreground/60">
                  Criado em{" "}
                  {format(new Date(doc.createdAt), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                {doc.client && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/70">
                    <User
                      weight="fill"
                      className="size-3 text-brand-primary/40"
                    />
                    {doc.client.name}
                  </div>
                )}
                {doc.project && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/70">
                    <Briefcase
                      weight="fill"
                      className="size-3 text-muted-foreground/30"
                    />
                    {doc.project.name}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-none",
                  statusColors[doc.status as keyof typeof statusColors]
                )}
              >
                {doc.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full border border-transparent hover:border-border/40"
                  >
                    <DotsThreeVertical weight="bold" className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-2xl border-border/40 bg-background/95 p-1.5 backdrop-blur-xl shadow-2xl"
                >
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary"
                  >
                    <Link
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={`/admin/documents/${doc.id}` as any}
                      className="flex items-center"
                    >
                      <Eye
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        Visualizar
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary"
                  >
                    <Link
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={`/admin/documents/${doc.id}/edit` as any}
                      className="flex items-center"
                    >
                      <Pencil
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        Editar
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive text-destructive/80">
                    <Trash weight="bold" className="mr-2.5 size-3.5" />
                    <span className="font-bold uppercase tracking-tight text-[10px]">
                      Excluir
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
