import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
    stripeInstance = new Stripe(key, {})
  }
  return stripeInstance
}

export const PLANS = {
  FREE: { id: "FREE", name: "مجاني", price: 0, contractsPerWeek: 3, priceIds: { month: null, year: null } },
  BASIC: { id: "BASIC", name: "أساسي", price: 199, contractsPerWeek: 30, priceIds: { month: process.env.STRIPE_BASIC_MONTH_PRICE_ID!, year: process.env.STRIPE_BASIC_YEAR_PRICE_ID! } },
  PRO: { id: "PRO", name: "احترافي", price: 399, contractsPerWeek: 100, priceIds: { month: process.env.STRIPE_PRO_MONTH_PRICE_ID!, year: process.env.STRIPE_PRO_YEAR_PRICE_ID! } },
  UNLIMITED: { id: "UNLIMITED", name: "غير محدود", price: 499, contractsPerWeek: Infinity, priceIds: { month: process.env.STRIPE_UNLIMITED_MONTH_PRICE_ID!, year: process.env.STRIPE_UNLIMITED_YEAR_PRICE_ID! } },
} as const

export type PlanId = keyof typeof PLANS

export function getPlanByPriceId(priceId: string): PlanId | null {
  for (const [id, plan] of Object.entries(PLANS)) {
    if (plan.priceIds.month === priceId || plan.priceIds.year === priceId) return id as PlanId
  }
  return null
}

export function getPriceId(planId: PlanId, interval: "month" | "year"): string | null {
  return PLANS[planId].priceIds[interval]
}

export function formatPrice(cents: number): string {
  return `${(cents / 100).toLocaleString("ar-EG")} ج.م`
}

export async function syncStripeSubscription(userId: string, stripeCustomerId: string) {
  try {
    const stripe = getStripe()
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 1,
    })
    const sub = subs.data[0]
    if (!sub) return

    const s = sub as any
    const status: string = s.status

    const { prisma } = await import("@/app/lib/prisma")

    if (status !== "active" && status !== "trialing") {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "FREE", stripeSubscriptionId: null, subscriptionEnds: null },
      })
      return
    }

    const priceId = s.items?.data?.[0]?.price?.id
    const planId = priceId ? getPlanByPriceId(priceId) : null
    if (!planId) return

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId,
        stripeSubscriptionId: s.id,
        subscriptionEnds: new Date(s.current_period_end * 1000),
      },
    })
  } catch {
    // فشل الاتصال بـ Stripe — نكمل بالبيانات المحلية
  }
}
