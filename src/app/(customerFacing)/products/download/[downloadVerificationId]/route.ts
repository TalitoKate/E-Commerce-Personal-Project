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
  console.log("Download requested for ID:", downloadVerificationId)
  
  const data = await db.downloadVerification.findFirst({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  })

  console.log("Download verification found:", !!data)
  
  if (!data) {
    console.log("No download verification found or expired")
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }
  
  if (!data.product?.filePath || !data.product?.name) {
    console.log("Product data incomplete", { filePath: !!data.product?.filePath, name: !!data.product?.name })
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }

  console.log("Redirecting to file:", data.product.filePath)
  // Add download parameter to force download instead of inline display
  const downloadUrl = new URL(data.product.filePath)
  downloadUrl.searchParams.set('download', '1')
  
  // filePath is now a Blob URL, redirect to it for download
  // Don't wrap in try-catch as redirect() throws NEXT_REDIRECT which should not be caught
  redirect(downloadUrl.toString())
}
