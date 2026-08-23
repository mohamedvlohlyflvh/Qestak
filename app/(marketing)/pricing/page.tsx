"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const plans = [
  { name: "مجاني", quota: 5, price: "مجاناً" },
  { name: "أساسي", quota: 30, price: "199 ج.م/شهر" },
  { name: "احترافي", quota: 100, price: "399 ج.م/شهر" },
  { name: "غير محدود", quota: Infinity, price: "499 ج.م/شهر" },
]

export default function PricingPage() {
  return (
    <div dir="rtl">
      <header className="glass-header px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold"><span className="text-gradient-gold">قسطك</span></Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">دخول</Link>
          <ThemeToggle iconOnly />
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-12 text-center">
        <div className="inline-flex items-center gap-2 glass-card !bg-[rgba(255,215,0,0.1)] !border-primary/30 !backdrop-blur-xl px-3 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-primary glow-gold inline-block" />
          <span className="text-xs font-semibold text-primary">خطط مرنة تناسب عملك</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">اختر خطتك المناسبة</h1>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto mb-6">
          ابدأ مجاناً وطور أعمالك مع الباقات المدفوعة.
        </p>

        <div className="glass-card !p-3 max-w-md mx-auto mb-6 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">📱 الدفع عبر فودافون كاش</p>
          <p className="text-xs text-muted-foreground">للتواصل والتحويل:</p>
          <p className="text-lg font-bold font-mono text-primary" dir="ltr">01206363468</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-right mx-auto max-w-5xl">
          {plans.map((plan) => (
            <div key={plan.name} className="glass-card p-3 sm:p-4 flex flex-col">
              <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
              <div className="mt-2 mb-1">
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {plan.name === "مجاني" ? `أول ${plan.quota} عقود مجاناً` : plan.quota === Infinity ? "عقود غير محدودة" : `حد أقصى ${plan.quota} عقد/أسبوع`}
              </p>
              <div className="flex-1" />
              {plan.name === "مجاني" ? (
                <Link href="/register" className="block text-center py-2 rounded-xl text-xs font-bold btn-gold">
                  ابدأ مجاناً
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  تواصل للاشتراك
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 glass-card !p-3 max-w-md mx-auto">
          <p className="text-xs text-muted-foreground">
            للاشتراك، تواصل على الرقم <strong>أولاً</strong>، ثم قم بالتحويل على رقم فودافون كاش بعد التنسيق.
          </p>
        </div>
      </section>
    </div>
  )
}
