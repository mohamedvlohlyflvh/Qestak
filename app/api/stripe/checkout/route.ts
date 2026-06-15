import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { getStripe, PLANS, getPriceId } from "@/app/lib/stripe"
import { checkCSRF, checkRateLimit } from "@/app/lib/security"

export async function POST(req: Request) {
  try {
    const csrf = checkCSRF(req)
    if (!csrf.ok) return Response.json({ error: csrf.reason }, { status: 403 })

    const session = await auth()
    if (!session?.user?.id) return Response.json({ error: "غير مصرح" }, { status: 401 })

    const rl = checkRateLimit(`checkout:${session.user.id}`, 3, 60_000)
    if (!rl.allowed) {
      return Response.json({ error: `طلبات كثيرة. حاول بعد ${Math.ceil(rl.resetIn / 1000)} ثانية` }, { status: 429 })
    }

    const { planId, interval = "month" } = await req.json()
    const plan = PLANS[planId as keyof typeof PLANS]
    const priceId = getPriceId(planId as keyof typeof PLANS, interval as "month" | "year")
    if (!plan || !priceId) {
      return Response.json({ error: "خطة غير صالحة" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return Response.json({ error: "المستخدم غير موجود" }, { status: 404 })

    let stripeCustomerId = user.stripeCustomerId
    const stripe = getStripe()

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.storeName || undefined,
        metadata: { userId: user.id },
      })
      stripeCustomerId = customer.id
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId } })
    }

    const checkout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/subscription?canceled=true`,
      metadata: { userId: user.id, planId, interval },
    })

    return Response.json({ url: checkout.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return Response.json({ error: "حدث خطأ أثناء إنشاء جلسة الدفع" }, { status: 500 })
  }
}
