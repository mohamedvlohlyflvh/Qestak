"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const plans = [
  {
    id: "FREE",
    name: "مجاني",
    monthly: "مجاناً",
    yearly: "مجاناً",
    period: "دائماً",
    quota: 5,
    features: [],
    cta: "ابدأ مجاناً",
    href: "/register",
    popular: false,
  },
  {
    id: "BASIC",
    name: "أساسي",
    monthly: "199",
    yearly: "1,990",
    period: "شهرياً",
    quota: 30,
    features: [],
    cta: "اشترك شهرياً",
    href: "/register?plan=BASIC",
    popular: true,
  },
  {
    id: "PRO",
    name: "احترافي",
    monthly: "399",
    yearly: "3,990",
    period: "شهرياً",
    quota: 100,
    features: [],
    cta: "اشترك شهرياً",
    href: "/register?plan=PRO",
    popular: false,
  },
  {
    id: "UNLIMITED",
    name: "غير محدود",
    monthly: "499",
    yearly: "5,000",
    period: "شهرياً",
    quota: Infinity,
    features: [],
    cta: "اشترك شهرياً",
    href: "/register?plan=UNLIMITED",
    popular: false,
  },
]

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

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
          ابدأ مجاناً وطور أعمالك مع الباقات المدفوعة. وفر ٢ شهر عند الاشتراك السنوي!
        </p>

        <div className="inline-flex items-center gap-3 glass-card !p-1.5 !shadow-none mx-auto w-fit max-w-full">
          <button onClick={() => setYearly(false)} className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${!yearly ? "btn-gold !rounded-lg" : "text-muted-foreground hover:text-foreground"}`}>شهري</button>
          <button onClick={() => setYearly(true)} className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${yearly ? "btn-gold !rounded-lg" : "text-muted-foreground hover:text-foreground"}`}>سنوي <span className="text-[10px] text-emerald-500 font-bold">وفر ٢ شهر</span></button>
        </div>

        <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 text-right mx-auto max-w-5xl overflow-visible">
          {plans.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly
            const period = yearly ? "سنوياً" : plan.period
            const ctaText = plan.id === "FREE" ? "ابدأ مجاناً" : yearly ? "اشترك سنوياً" : "اشترك شهرياً"
            const href = plan.id === "FREE" ? "/register" : `/register?plan=${plan.id}${yearly ? "&interval=year" : ""}`

            return (
              <div
                key={`${plan.id}-${yearly ? "year" : "month"}`}
                className={`relative flex flex-col ${plan.popular ? "glass-card-active" : "glass-card"} p-4 sm:p-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] font-bold text-primary-foreground bg-primary px-3 py-0.5 rounded-full shadow-lg">
                      الأكثر طلباً
                    </span>
                  </div>
                )}
                {plan.id === "UNLIMITED" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20 shadow-lg">
                      الأقوى
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-foreground mt-1">{plan.name}</h2>
                <div className="mt-4 mb-1">
                  <span className="text-3xl font-bold text-foreground">
                    {price === "مجاناً" ? price : `${price} ج.م`}
                  </span>
                  {price !== "مجاناً" && <span className="text-sm text-muted-foreground mr-1">/{period}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-8">
                  {plan.id === "FREE" ? `أول ${plan.quota} عقود مجاناً` : plan.quota === Infinity ? "عقود غير محدودة" : `حد أقصى ${plan.quota} عقد/أسبوع`}
                </p>

                <div className="flex-1" />

                <Link
                  href={href}
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                    plan.popular
                      ? "btn-gold !rounded-xl"
                      : plan.id === "UNLIMITED"
                      ? "btn-glass !rounded-xl !border-emerald-500/30 !text-emerald-500 hover:!border-emerald-500/60"
                      : "btn-glass !rounded-xl"
                  }`}
                >
                  {ctaText}
                </Link>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
