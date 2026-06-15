import { getStripe, getPlanByPriceId, PLANS } from "@/app/lib/stripe"
import { prisma } from "@/app/lib/prisma"

async function ensureWebhookTable() {
  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM "WebhookEvent" LIMIT 1')
  } catch {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "WebhookEvent" ("id" TEXT NOT NULL, "type" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id"))`).catch(() => {})
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt")`).catch(() => {})
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: "توقيع غير صالح" }, { status: 400 })
  }

  await ensureWebhookTable()

  // Idempotency: استخدم unique constraint عشان نضمن معالجة كل حدث مرة واحدة
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } })
  } catch (e: any) {
    // لو الحدث موجود بالفعل (P2002 = duplicate key)، اتجاوز
    if (e?.code === "P2002") return Response.json({ received: true, duplicate: true })
    throw e
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object as any
        if (checkout.payment_status !== "paid" && checkout.payment_status !== "no_payment_required") break

        const userId = checkout.metadata?.userId
        const planId = checkout.metadata?.planId as keyof typeof PLANS | undefined
        if (userId && planId && PLANS[planId]) {
          const stripe = getStripe()
          let subEnd: Date | null = null
          if (checkout.subscription) {
            const sub = await stripe.subscriptions.retrieve(checkout.subscription as string) as unknown as { current_period_end: number }
            subEnd = new Date(sub.current_period_end * 1000)
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: checkout.customer as string,
              stripeSubscriptionId: checkout.subscription as string,
              plan: planId,
              subscriptionEnds: subEnd || new Date(Date.now() + 30 * 86400000),
            },
          })
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any
        let userId = subscription.metadata?.userId as string | undefined

        if (!userId) {
          const customerId = subscription.customer as string
          const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
          if (!user) break
          userId = user.id
        }

        if (event.type === "customer.subscription.deleted") {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: "FREE", stripeSubscriptionId: null, subscriptionEnds: null },
          })
        } else {
          const priceId = subscription.items.data[0]?.price.id
          const planId = priceId ? getPlanByPriceId(priceId) : null
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: planId || "FREE",
              stripeSubscriptionId: subscription.id,
              subscriptionEnds: new Date(subscription.current_period_end * 1000),
            },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        const customerId = invoice.customer as string
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
        if (user) {
          await prisma.notification.create({
            data: {
              title: "فشل تجديد الاشتراك",
              message: "لم نتمكن من تحصيل قيمة اشتراكك الشهري. يرجى تحديث وسيلة الدفع.",
              priority: "HIGH",
              merchantId: user.id,
            },
          })
        }
        break
      }
    }

    return Response.json({ received: true })
  } catch (err) {
    // لو فشلت المعالجة، احذف الحدث عشان Stripe يعيد المحاولة
    await prisma.webhookEvent.delete({ where: { id: event.id } }).catch(() => {})
    console.error("Webhook processing error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
