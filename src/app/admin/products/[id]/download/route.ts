export const dynamic = "force-dynamic"

import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      select: { filePath: true, name: true },
    })

    if (product == null) {
      return new NextResponse("Not found", { status: 404 })
    }

    // filePath is now a Blob URL, redirect to it for download
    redirect(product.filePath)
  } catch (err) {
    console.error("Admin download route error:", err)
    return new NextResponse("Server error", { status: 500 })
  }
}
