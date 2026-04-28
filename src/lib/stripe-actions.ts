import { env } from "@/src/config/env"

import { logger } from "./logger"
import prisma from "./prisma"
import { stripe } from "./stripe"

export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: user.id,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

export async function createCheckoutSession(installmentId: string) {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: {
      invoice: {
        include: {
          project: {
            select: { id: true, clientId: true, name: true },
          },
        },
      },
    },
  })

  if (!installment) {
    throw new Error("Installment not found")
  }

  if (installment.status === "PAID") {
    throw new Error("Installment is already paid")
  }

  const clientId = installment.invoice.project?.clientId
  if (!clientId) {
    throw new Error("Client not found for this invoice")
  }

  const stripeCustomerId = await getOrCreateStripeCustomer(clientId)

  const successUrl = `${env.NEXT_PUBLIC_SITE_URL}/projects/${installment.invoice.project?.id}/financial?success=true&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${env.NEXT_PUBLIC_SITE_URL}/projects/${installment.invoice.project?.id}/financial?canceled=true`

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: installment.invoice.currency.toLowerCase(),
          product_data: {
            name: `${installment.invoice.title} - Parcela ${installment.number}`,
            description: `Referente ao projeto ${installment.invoice.project?.name}`,
          },
          unit_amount: Math.round(installment.amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      installmentId: installment.id,
      invoiceId: installment.invoiceId,
    },
    payment_intent_data: {
      metadata: {
        installmentId: installment.id,
      },
    },
  })

  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      stripeCheckoutSessionId: session.id,
      stripeCheckoutUrl: session.url,
    },
  })

  return session
}
