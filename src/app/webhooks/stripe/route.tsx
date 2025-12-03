export const dynamic = "force-dynamic"

import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {

  apiVersion: "2023-10-16",
})

const resend = new Resend(process.env.RESEND_API_KEY as string)

async function handleSuccessfulPayment({
  productId,
  email,
  pricePaidInCents,
}: {
  productId: string
  email: string
  pricePaidInCents: number
}) {
  const product = await db.product.findUnique({ where: { id: productId } })
  if (product == null || email == null) {
    throw new Error("Missing product or email")
  }

  const userFields = {
    email,
    orders: { create: { productId, pricePaidInCents } },
  }

  const {
    orders: [order],
  } = await db.user.upsert({
    where: { email },
    create: userFields,
    update: userFields,
    select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
  })

  const downloadVerification = await db.downloadVerification.create({
    data: {
      productId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), 
    },
  })

  await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "Order Confirmation",
    react: (
      <PurchaseReceiptEmail
        order={order}
        product={product}
        downloadVerificationId={downloadVerification.id}
      />
    ),
  })
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") as string

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    console.error("Webhook signature verification failed", err)
    return new NextResponse("Webhook Error", { status: 400 })
  }


  try {
    if (event.type === "charge.succeeded") {
      const charge = event.data.object as Stripe.Charge

      const productId = charge.metadata.productId
      const email = charge.billing_details.email
      const pricePaidInCents = charge.amount

      if (!productId || !email) {
        throw new Error("Missing productId or email on charge")
      }

      await handleSuccessfulPayment({ productId, email, pricePaidInCents })
    }

    if (event.type === "payment_intent.succeeded") {
  const intent = event.data.object as Stripe.PaymentIntent

  const productId = intent.metadata?.productId

  const charges = (intent as any).charges?.data ?? []

  const email =
    intent.receipt_email ??

    // @ts-ignore
    intent.customer_email ??
    charges[0]?.billing_details?.email ??
    null

  const pricePaidInCents = intent.amount_received

  if (!productId || !email) {
    throw new Error("Missing productId or email on payment_intent")
  }

  await handleSuccessfulPayment({ productId, email, pricePaidInCents })
}

    return new NextResponse("OK", { status: 200 })
  } catch (err) {
    console.error("Error handling webhook", err)
    return new NextResponse("Webhook handler error", { status: 500 })
  }
}
