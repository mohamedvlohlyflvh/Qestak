"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { registerUser } from "@/app/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const result = await registerUser(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/login?registered=true")
    }
  }

  return (
    <div className="min-h-screen px-4" dir="rtl">
      <div className="flex justify-end pt-4 px-4 max-w-sm mx-auto">
        <ThemeToggle iconOnly />
      </div>
      <div className="flex items-center justify-center px-4" style={{ minHeight: "calc(100vh - 60px)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold"><span className="text-gradient-gold">قسطك</span></h1>
          <p className="text-sm text-muted-foreground mt-1">منصة إدارة التقسيط الذكية</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center text-foreground">إنشاء حساب جديد</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 text-center border border-destructive/20">{error}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">الاسم الكامل</label>
            <input id="name" name="name" type="text" required className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
            <input id="email" name="email" type="email" required dir="ltr" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور</label>
            <input id="password" name="password" type="password" required minLength={6} dir="ltr" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all" />
          </div>
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-foreground mb-1.5">اسم المتجر (اختياري)</label>
            <input id="storeName" name="storeName" type="text" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف (اختياري)</label>
            <input id="phone" name="phone" type="tel" dir="ltr" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full text-center !py-3"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  )
}
