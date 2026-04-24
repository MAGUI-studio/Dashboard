import * as React from "react"

import { notFound, redirect } from "next/navigation"

import fs from "node:fs/promises"
import path from "node:path"
import ReactMarkdown from "react-markdown"

import { getCurrentAppUser } from "@/src/lib/project-governance"

interface DocPageProps {
  params: Promise<{ slug: string[]; locale: string }>
}

export default async function DynamicDocPage({ params }: DocPageProps) {
  const { slug } = await params
  const user = await getCurrentAppUser()

  if (!user) return redirect("/sign-in")

  // Permission Check: restrict admin/ docs to ADMIN role
  if (slug[0] === "admin" && user.role !== "ADMIN") {
    return redirect("/docs")
  }

  const filePath = path.join(process.cwd(), "docs", ...slug) + ".md"

  let content = ""
  try {
    content = await fs.readFile(filePath, "utf-8")
  } catch (error) {
    console.error("Error reading doc file:", error)
    return notFound()
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
