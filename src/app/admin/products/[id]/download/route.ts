export const dynamic = "force-dynamic"

import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

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

    // Resolve file path safely. If the stored path is relative, assume it's inside `public/`.
    let filePath = product.filePath
    if (!path.isAbsolute(filePath)) {
      // strip leading slashes to avoid absolute join issues
      filePath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""))
    }

    // Check file existence and read it. If missing, return 404 instead of throwing.
    let stat
    try {
      stat = await fs.stat(filePath)
    } catch (err) {
      console.error("Download file stat error:", err)
      return new NextResponse("File not found", { status: 404 })
    }

    const fileBuffer = await fs.readFile(filePath)
    const body = new Uint8Array(fileBuffer)
    const extension = filePath.split(".").pop()

    return new NextResponse(body, {
      headers: {
        "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
        "Content-Length": stat.size.toString(),
      },
    })
  } catch (err) {
    console.error("Admin download route error:", err)
    return new NextResponse("Server error", { status: 500 })
  }
}
