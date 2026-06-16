import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/lib/prisma"
import { SubscriptionManager } from "./subscription-manager"
import { PLANS, syncStripeSubscription } from "@/app/lib/stripe"

export default async function SubscriptionPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, stripeCustomerId: true, stripeSubscriptionId: true, subscriptionEnds: true },
  })
  if (!user) redirect("/login")

  if (user.plan === "FREE" && user.stripeCustomerId) {
    await syncStripeSubscription(userId, user.stripeCustomerId)
    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCustomerId: true, stripeSubscriptionId: true, subscriptionEnds: true },
    })
    if (refreshed) user = refreshed
  }

  const plan = PLANS[user.plan]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">الاشتراك</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة خطتك وفواتيرك</p>
      </div>

      <div className="glass-card !p-5 mb-8 max-w-md mx-auto text-center">
        <p className="text-xs text-muted-foreground mb-2">الخطة الحالية</p>
        <p className="text-xl font-bold text-foreground">{plan.name}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {typeof plan.contractsPerWeek === "number" ? `${plan.contractsPerWeek} عقد/أسبوع` : "غير محدود"}
          </span>
          {user.subscriptionEnds && (
            <span className="text-xs text-muted-foreground">
              حتى {user.subscriptionEnds.toLocaleDateString("ar-EG")}
            </span>
          )}
        </div>
      </div>

      <SubscriptionManager currentPlan={user.plan} hasSubscription={!!user.stripeSubscriptionId} />
    </div>
  )
}
