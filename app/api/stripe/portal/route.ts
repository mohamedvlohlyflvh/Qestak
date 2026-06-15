import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { getStripe } from "@/app/lib/stripe"
import { checkCSRF, checkRateLimit } from "@/app/lib/security"

export async function POST(req: Request) {
  try {
    const csrf = checkCSRF(req)
    if (!csrf.ok) return Response.json({ error: csrf.reason }, { status: 403 })

    const session = await auth()
    if (!session?.user?.id) return Response.json({ error: "غير مصرح" }, { status: 401 })

    const rl = checkRateLimit(`portal:${session.user.id}`, 5, 60_000)
    if (!rl.allowed) {
      return Response.json({ error: `طلبات كثيرة. حاول بعد ${Math.ceil(rl.resetIn / 1000)} ثانية` }, { status: 429 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })
    if (!user?.stripeCustomerId) {
      return Response.json({ error: "لا يوجد حساب دفع مرتبط" }, { status: 400 })
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/subscription`,
    })

    return Response.json({ url: portalSession.url })
  } catch (error) {
    console.error("Portal error:", error)
    return Response.json({ error: "حدث خطأ في فتح بوابة الدفع" }, { status: 500 })
  }
}
