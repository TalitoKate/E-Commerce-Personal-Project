export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  try {
    const data = await db.downloadVerification.findUnique({
      where: {
        id: downloadVerificationId,
        expiresAt: { gt: new Date() },
      },
      select: {
        product: {
          select: { filePath: true, name: true },
        },
      },
    })

    if (data == null || !data.product?.filePath) {
      return NextResponse.redirect(new URL("/products/download/expired", req.url))
    }

    // If filePath is stored like "files/my-product.pdf",
    // resolve it relative to the project root:
    const absolutePath = path.isAbsolute(data.product.filePath)
      ? data.product.filePath
      : path.join(process.cwd(), data.product.filePath)

    const stat = await fs.stat(absolutePath)
    const file = await fs.readFile(absolutePath)
    const extension = data.product.filePath.split(".").pop() ?? "bin"

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
        "Content-Length": stat.size.toString(),
        "Content-Type": "application/octet-stream",
      },
    })
  } catch (err) {
    console.error(
      "Error in /products/download/[downloadVerificationId] route:",
      err
    )
    // Never let an error bubble up to the build/runtime – always fallback
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }
}
