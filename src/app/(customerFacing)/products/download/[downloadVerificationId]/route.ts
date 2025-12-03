export const dynamic = "force-dynamic"

import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

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

    const { size } = await fs.stat(data.product.filePath)
    const fileBuffer = await fs.readFile(data.product.filePath)
    const body = new Uint8Array(fileBuffer)
    const extension = data.product.filePath.split(".").pop()

    return new NextResponse(body, {
      headers: {
        "Content-Disposition": `attachment; filename=\"${data.product.name}.${extension}\"`,
        "Content-Length": size.toString(),
      },
    })
  } catch (err) {
    console.error("Download route error:", err)
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }
}
