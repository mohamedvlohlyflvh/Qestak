import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/lib/prisma"
import { SubscriptionManager } from "./subscription-manager"
import { TrialBadge } from "./trial-badge"
import { PLANS } from "@/app/lib/plans"

function getRemainingTrialDays(createdAt: Date): number {
  const trialDays = PLANS.FREE.trialDays
  const elapsed = Math.floor((Date.now() - createdAt.getTime()) / 86400000)
  return Math.max(0, trialDays - elapsed)
}

export default async function SubscriptionPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, createdAt: true },
  })
  if (!user) redirect("/login")

  const plan = PLANS[user.plan as keyof typeof PLANS] ?? PLANS.FREE
  const remainingTrialDays = user.plan === "FREE" ? getRemainingTrialDays(user.createdAt) : null

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
          <TrialBadge remainingTrialDays={remainingTrialDays} planId={user.plan} />
        </div>
      </div>

      <SubscriptionManager currentPlan={user.plan} />
    </div>
  )
}
