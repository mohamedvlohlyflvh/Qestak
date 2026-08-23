"use client"

import { PLANS } from "@/app/lib/plans"

export function TrialBadge({ remainingTrialDays, planId }: { remainingTrialDays: number | null; planId: string }) {
  if (planId !== "FREE") {
    const plan = PLANS[planId as keyof typeof PLANS]
    return (
      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
        {typeof plan?.contractsPerWeek === "number"
          ? `${plan.contractsPerWeek} عقد/أسبوع`
          : "غير محدود"}
      </span>
    )
  }

  if (remainingTrialDays === null) return null

  return (
    <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
      {remainingTrialDays > 0
        ? `فترة تجريبية — متبقي ${remainingTrialDays} ${remainingTrialDays === 1 ? "يوم" : "أيام"}`
        : "انتهت الفترة التجريبية"}
    </span>
  )
}
