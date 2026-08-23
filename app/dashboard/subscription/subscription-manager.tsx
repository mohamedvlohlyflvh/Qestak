"use client"

import { PLANS } from "@/app/lib/plans"
import { CONTACT_PHONES, VODAFONE_CASH_NUMBER } from "@/app/lib/site-config"

export function SubscriptionManager({
  currentPlan,
}: {
  currentPlan: string
}) {
  const paidPlans = [PLANS.BASIC, PLANS.PRO, PLANS.UNLIMITED]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6! max-w-md mx-auto text-center">
        <h3 className="text-lg font-bold text-foreground mb-3">📱 الدفع عبر فودافون كاش</h3>

        <div className="bg-muted rounded-xl p-5 space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">للتواصل:</p>
            {CONTACT_PHONES.map((phone) => (
              <p key={phone.phone} className="text-base font-bold font-mono text-primary" dir="ltr">
                {phone.label}: {phone.phone}
              </p>
            ))}
            <p className="text-xs text-muted-foreground mt-2">للتحويل (فودافون كاش):</p>
            <p className="text-lg font-bold font-mono text-primary" dir="ltr">{VODAFONE_CASH_NUMBER}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            تواصل على أحد الرقمين <strong>أولاً</strong>، ثم قم بالتحويل على رقم فودافون كاش بعد التنسيق.
          </p>
        </div>
      </div>

      <div className="glass-card p-5! max-w-md mx-auto text-center">
        <h3 className="text-sm font-semibold text-foreground mb-2">الباقات المتاحة</h3>
        <div className="space-y-3 text-right">
          {paidPlans.map((p) => {
            const desc = p.contractsPerWeek === Infinity ? "عقود غير محدودة" : `${p.contractsPerWeek} عقد/أسبوع`
            const price = `${p.price} ج.م/شهر`
            const isCurrent = currentPlan === p.id
            return (
              <div key={p.id} className={`${isCurrent ? "bg-primary/10 border border-primary/20" : "bg-muted"} rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
