"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type PlanId } from "@/app/lib/stripe"
import { Suspense } from "react"

const plans = [
  {
    id: "FREE" as PlanId,
    name: "مجاني",
    monthly: "مجاناً",
    yearly: "مجاناً",
    quota: 5,
    popular: false,
    features: [],
  },
  {
    id: "BASIC" as PlanId,
    name: "أساسي",
    monthly: "199 ج.م/شهر",
    yearly: "1,990 ج.م/سنة",
    quota: 30,
    popular: true,
    features: [],
  },
  {
    id: "PRO" as PlanId,
    name: "احترافي",
    monthly: "399 ج.م/شهر",
    yearly: "3,990 ج.م/سنة",
    quota: 100,
    popular: false,
    features: [],
  },
  {
    id: "UNLIMITED" as PlanId,
    name: "غير محدود",
    monthly: "499 ج.م/شهر",
    yearly: "5,000 ج.م/سنة",
    quota: null,
    popular: false,
    features: [],
  },
]

function SubscriptionPlans({ currentPlan, hasSubscription }: { currentPlan: string; hasSubscription: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  const handleStripe = useCallback(async (planId: PlanId) => {
    setLoading(`stripe-${planId}`)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: yearly ? "year" : "month" }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "حدث خطأ في عملية الدفع")
        return
      }
      if (data.url) window.location.href = data.url
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("انتهت مهلة الاتصال، حاول مرة أخرى")
      } else {
        setError("حدث خطأ غير متوقع. حاول مرة أخرى.")
      }
    } finally {
      setLoading(null)
    }
  }, [yearly])

  return (
    <div className="text-center">
      {success === "true" && (
        <div className="glass-card !border-emerald-500/30 !p-4 mb-6 text-sm text-emerald-600 dark:text-emerald-400 max-w-md mx-auto">
          تم تفعيل الاشتراك بنجاح! 🎉
        </div>
      )}
      {canceled === "true" && (
        <div className="glass-card !border-amber-500/30 !p-4 mb-6 text-sm text-amber-600 dark:text-amber-400 max-w-md mx-auto">
          تم إلغاء عملية الدفع. لم يتم تحصيل أي رسوم.
        </div>
      )}
      {error && (
        <div className="glass-card !border-destructive/30 !p-4 mb-6 text-sm text-destructive max-w-md mx-auto">
          {error}
        </div>
      )}

      <div className="inline-flex items-center gap-3 glass-card !p-1.5 !shadow-none mx-auto w-fit max-w-full mb-8">
        <button onClick={() => setYearly(false)} className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all ${!yearly ? "btn-gold !rounded-lg" : "text-muted-foreground hover:text-foreground"}`}>شهري</button>
        <button onClick={() => setYearly(true)} className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all ${yearly ? "btn-gold !rounded-lg" : "text-muted-foreground hover:text-foreground"}`}>سنوي <span className="text-[10px] text-emerald-500 font-bold">وفر ٢ شهر</span></button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right mx-auto max-w-5xl">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id
          const price = yearly ? plan.yearly : plan.monthly

          return (
            <div
              key={`${plan.id}-${yearly ? "year" : "month"}`}
              className={`relative flex flex-col ${plan.popular ? "glass-card-active" : "glass-card"} p-4 sm:p-5 ${isCurrent ? "ring-2 ring-primary" : ""}`}
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

              <h3 className="text-lg font-bold text-foreground mt-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-3">{price}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-8">
                {plan.id === "FREE" ? `أول ${plan.quota} عقود مجاناً` : plan.quota ? `حد أقصى ${plan.quota} عقد/أسبوع` : "عقود غير محدودة"}
              </p>

              <div className="flex-1" />

              {isCurrent && (
                <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed">
                  خطتك الحالية
                </button>
              )}
              {!isCurrent && plan.id !== "FREE" && (
                <button
                  onClick={() => handleStripe(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${
                    plan.popular ? "btn-gold !rounded-lg" : plan.id === "UNLIMITED" ? "btn-glass !rounded-lg !border-emerald-500/30 !text-emerald-500 hover:!border-emerald-500/60" : "btn-glass !rounded-lg"
                  }`}
                >
                  {loading === `stripe-${plan.id}` ? "جاري..." : yearly ? "اشترك سنوياً" : "اشترك شهرياً"}
                </button>
              )}
              {!isCurrent && plan.id === "FREE" && (
                <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed">
                  5 عقود مجانية
                </button>
              )}
            </div>
          )
        })}
      </div>

      {hasSubscription && <PortalSection />}
    </div>
  )
}

function PortalSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOpenPortal() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "تعذر فتح بوابة الدفع")
        return
      }
      if (data.url) window.location.href = data.url
      else setError("تعذر فتح بوابة الدفع")
    } catch {
      setError("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 glass-card !p-5 max-w-md mx-auto text-center">
      <h3 className="text-sm font-semibold text-foreground mb-2">إدارة الدفع</h3>
      <p className="text-xs text-muted-foreground mb-3">
        يمكنك إدارة طريقة الدفع أو إلغاء الاشتراك من بوابة الدفع.
      </p>
      {error && <p className="text-xs text-destructive mb-2">{error}</p>}
      <button onClick={handleOpenPortal} disabled={loading} className="px-5 py-2 btn-glass !rounded-lg disabled:opacity-50">
        {loading ? "جاري الفتح..." : "بوابة الدفع"}
      </button>
    </div>
  )
}

export function SubscriptionManager(props: { currentPlan: string; hasSubscription: boolean }) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground text-center">جاري التحميل...</div>}>
      <SubscriptionPlans {...props} />
    </Suspense>
  )
}
