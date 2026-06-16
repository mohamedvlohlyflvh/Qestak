"use client"

export function SubscriptionManager({ currentPlan }: { currentPlan: string; hasSubscription: boolean }) {
  return (
    <div className="space-y-6">
      <div className="glass-card !p-6 max-w-md mx-auto text-center">
        <h3 className="text-lg font-bold text-foreground mb-3">💳 قريباً</h3>
        <p className="text-sm text-muted-foreground mb-4">
          الدفع الإلكتروني عبر البطاقات البنكية قيد التفعيل. حالياً يمكنك الدفع عبر:
        </p>

        <div className="bg-muted rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">📱</span>
            <span className="text-sm font-semibold text-foreground">فودافون كاش</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">للتواصل:</p>
            <p className="text-base font-bold font-mono text-primary" dir="ltr">01093195795</p>
            <p className="text-base font-bold font-mono text-primary" dir="ltr">01206363468</p>
            <p className="text-xs text-muted-foreground mt-2">للتحويل (فودافون كاش):</p>
            <p className="text-lg font-bold font-mono text-primary" dir="ltr">01093195795</p>
          </div>
          <p className="text-xs text-muted-foreground">
            تواصل على أحد الرقمين <strong>أولاً</strong>، ثم قم بالتحويل على رقم فودافون كاش بعد التنسيق.
          </p>
        </div>
      </div>

      <div className="glass-card !p-5 max-w-md mx-auto text-center">
        <h3 className="text-sm font-semibold text-foreground mb-2">الباقات المتاحة</h3>
        <div className="space-y-3 text-right">
          {[
            { name: "أساسي", price: "199 ج.م/شهر", desc: "30 عقد/أسبوع" },
            { name: "احترافي", price: "399 ج.م/شهر", desc: "100 عقد/أسبوع" },
            { name: "غير محدود", price: "499 ج.م/شهر", desc: "عقود غير محدودة" },
          ].map((p) => (
            <div key={p.name} className={`${currentPlan === p.name ? "bg-primary/10 border border-primary/20" : "bg-muted"} rounded-lg p-3`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.price}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
