"use client"

import * as React from "react"

import { Card, CardContent } from "@/src/components/ui/card"

interface DocumentViewerProps {
  document: {
    title: string
    clauses: Array<{
      id: string
      title: string
      content: string
      order: number
    }>
  }
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  return (
    <Card className="rounded-[2.5rem] border-border/40 bg-background/40 shadow-sm overflow-hidden">
      <CardContent className="p-12 space-y-12 max-w-4xl mx-auto">
        <header className="text-center space-y-4">
          <h2 className="font-heading text-2xl font-black uppercase tracking-tight">
            {document.title}
          </h2>
          <div className="h-1 w-20 bg-brand-primary mx-auto rounded-full" />
        </header>

        <div className="space-y-10">
          {document.clauses.map((clause, idx) => (
            <article key={clause.id} className="space-y-4">
              <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground/90">
                CLÁUSULA {idx + 1} - {clause.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {clause.content}
              </p>
            </article>
          ))}
        </div>

        <footer className="pt-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          Documento estruturado via MAGUI.studio Digital Authority System
        </footer>
      </CardContent>
    </Card>
  )
}
