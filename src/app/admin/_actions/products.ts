"use server"

import db from "@/db/db"
import { z } from "zod"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"

const fileSchema = z.instanceof(File, { message: "Required" })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/")
)

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required"),
})

export async function addProduct(prevState: unknown, formData: FormData) {
  try {
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return result.error.formErrors.fieldErrors
    }

    const data = result.data

    // Upload file to Vercel Blob
    const fileBlob = await put(
      `products/${crypto.randomUUID()}-${data.file.name}`,
      data.file,
      { access: "public" }
    )

    // Upload image to Vercel Blob
    const imageBlob = await put(
      `products/images/${crypto.randomUUID()}-${data.image.name}`,
      data.image,
      { access: "public" }
    )

    await db.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        filePath: fileBlob.url,
        imagePath: imageBlob.url,
      },
    })

    revalidatePath("/")
    revalidatePath("/home")
    revalidatePath("/products")
  } catch (error) {
    console.error("Error adding product:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { _form: [`Failed to add product: ${errorMessage}`] }
  }

  redirect("/admin/products")
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  try {
    const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return result.error.formErrors.fieldErrors
    }

    const data = result.data
    const product = await db.product.findUnique({ where: { id } })

    if (product == null) return notFound()

    let filePath = product.filePath
    if (data.file != null && data.file.size > 0) {
      // Delete old file from Blob
      await del(product.filePath)
      // Upload new file
      const fileBlob = await put(
        `products/${crypto.randomUUID()}-${data.file.name}`,
        data.file,
        { access: "public" }
      )
      filePath = fileBlob.url
    }

    let imagePath = product.imagePath
    if (data.image != null && data.image.size > 0) {
      // Delete old image from Blob
      await del(product.imagePath)
      // Upload new image
      const imageBlob = await put(
        `products/images/${crypto.randomUUID()}-${data.image.name}`,
        data.image,
        { access: "public" }
      )
      imagePath = imageBlob.url
    }

    await db.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        filePath,
        imagePath,
      },
    })

    revalidatePath("/")
    revalidatePath("/home")
    revalidatePath("/products")
  } catch (error) {
    console.error("Error updating product:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { _form: [`Failed to update product: ${errorMessage}`] }
  }

  redirect("/admin/products")
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })

  revalidatePath("/")
  revalidatePath("/home")
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } })

  if (product == null) return notFound()

  // Delete files from Vercel Blob
  await del(product.filePath)
  await del(product.imagePath)

  revalidatePath("/")
  revalidatePath("/home")
  revalidatePath("/products")
}