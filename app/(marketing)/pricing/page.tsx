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

      <section className="max-w-6xl mx-auto px-4 pt-16 sm:pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 glass-card !bg-[rgba(255,215,0,0.1)] !border-primary/30 !backdrop-blur-xl px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary glow-gold inline-block" />
          <span className="text-xs font-semibold text-primary">خطط مرنة تناسب عملك</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">اختر خطتك المناسبة</h1>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          ابدأ مجاناً وطور أعمالك مع الباقات المدفوعة.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right mx-auto max-w-5xl">
          {plans.map((plan) => (
            <div key={plan.name} className="glass-card p-4 sm:p-6 flex flex-col">
              <h2 className="text-xl font-bold text-foreground mt-1">{plan.name}</h2>
              <div className="mt-4 mb-1">
                <span className="text-3xl font-bold text-foreground">
                  {plan.price}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-8">
                {plan.name === "مجاني" ? `أول ${plan.quota} عقود مجاناً` : plan.quota === Infinity ? "عقود غير محدودة" : `حد أقصى ${plan.quota} عقد/أسبوع`}
              </p>
              <div className="flex-1" />
              {plan.name === "مجاني" ? (
                <Link href="/register" className="block text-center py-3 rounded-xl text-sm font-bold btn-gold !rounded-xl">
                  ابدأ مجاناً
                </Link>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">الدفع الإلكتروني قريباً</p>
                  <p className="text-sm font-semibold text-foreground">📱 فودافون كاش</p>
                  <p className="text-xs text-muted-foreground">للتواصل أولاً:</p>
                  <p className="text-base font-bold font-mono text-primary" dir="ltr">01206363468</p>
                  <p className="text-xs text-muted-foreground mt-1">للتحويل (فودافون كاش):</p>
                  <p className="text-base font-bold font-mono text-primary" dir="ltr">01093195795</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 glass-card !p-5 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            للاشتراك، تواصل على رقم التواصل <strong>أولاً</strong>، ثم قم بالتحويل على فودافون كاش بعد التنسيق.
          </p>
        </div>
      </section>
    </div>
  )
}
