import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import Stripe from "stripe"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import { revalidateProjectData } from "@/src/lib/revalidate"
import { stripe } from "@/src/lib/stripe"

import { env } from "@/src/config/env"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined")
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    logger.error({ err: error }, "Webhook signature verification failed")
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const installmentId = session.metadata?.installmentId

    if (installmentId) {
      const installment = await prisma.installment.update({
        where: { id: installmentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
        },
        include: {
          invoice: true,
        },
      })

      // Add a payment event
      await prisma.paymentEvent.create({
        data: {
          installmentId,
          type: "STRIPE",
          amount: (session.amount_total ?? 0) / 100,
          date: new Date(),
          note: `Pagamento via Stripe (Checkout Session: ${session.id})`,
        },
      })

      // Update invoice status if all installments paid
      const invoice = await prisma.invoice.findUnique({
        where: { id: installment.invoiceId },
        include: { installments: true },
      })

      if (invoice && invoice.installments.every((i) => i.status === "PAID")) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID" },
        })
      } else if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "PARTIALLY_PAID" },
        })
      }

      logger.info(
        { installmentId },
        "Installment marked as PAID via Stripe webhook"
      )

      // Revalidate paths using project helper
      if (installment.invoice.projectId) {
        revalidateProjectData(installment.invoice.projectId)
      }
      revalidatePath("/admin/financial")
    }
  }

  return NextResponse.json({ received: true })
}
