import { NextRequest, NextResponse } from "next/server"

import prisma from "@/src/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { linkId } = await req.json()

    if (!linkId) {
      return NextResponse.json({ error: "linkId is required" }, { status: 400 })
    }

    await prisma.maguiConnectLink.update({
      where: { id: linkId },
      data: {
        clickCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
