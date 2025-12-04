export const dynamic = "force-dynamic"

import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"

export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  try {
    const data = await db.downloadVerification.findFirst({
      where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
      select: { product: { select: { filePath: true, name: true } } },
    })

    if (!data || !data.product?.filePath || !data.product?.name) {
      return NextResponse.redirect(new URL("/products/download/expired", req.url))
    }

    // filePath is now a Blob URL, redirect to it for download
    redirect(data.product.filePath)
  } catch (err) {
    console.error("Download route error:", err)
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }
}
