import * as React from "react"

import { NextRequest, NextResponse } from "next/server"

import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer"

import { MaguiContractTemplate } from "@/src/lib/pdf/MaguiContractTemplate"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Both admins and clients should be able to view their documents
    // But for now, let's stick to admin protect as per proposal pattern
    await protect("admin")

    const { id } = await params

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        clauses: { orderBy: { order: "asc" } },
        signers: true,
      },
    })

    if (!doc) {
      return new NextResponse("Document not found", { status: 404 })
    }

    const buffer = await renderToBuffer(
      React.createElement(MaguiContractTemplate, {
        document: {
          title: doc.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contractedData: doc.contractedData as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contractingData: doc.contractingData as any,
          clauses: doc.clauses,
          signers: doc.signers as Array<{ name: string; role: string }>,
          createdAt: doc.createdAt,
        },
      }) as unknown as React.ReactElement<DocumentProps>
    )

    const shouldDownload = req.nextUrl.searchParams.get("download") === "1"
    const safeFileName = `${doc.title.toLowerCase().replace(/\s+/g, "-")}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${safeFileName}"`,
        "Cache-Control": "no-store, max-age=0",
        "Content-Length": String(buffer.length),
      },
    })
  } catch (error) {
    console.error("PDF Generation Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
