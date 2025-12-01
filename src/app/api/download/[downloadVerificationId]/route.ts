// src/app/api/download/[downloadVerificationId]/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
    });

    if (data == null || !data.product?.filePath) {
      return NextResponse.redirect(
        new URL("/products/download/expired", req.url)
      );
    }

    const relativePath = data.product.filePath;

    const absolutePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath);

    const stat = await fs.stat(absolutePath);
    const file = await fs.readFile(absolutePath);
    const extension = relativePath.split(".").pop() ?? "bin";

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
        "Content-Length": stat.size.toString(),
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err) {
    console.error(
      "Error in /api/download/[downloadVerificationId] route:",
      err
    );
    return NextResponse.redirect(
      new URL("/products/download/expired", req.url)
    );
  }
}
