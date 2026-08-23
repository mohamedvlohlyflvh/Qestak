"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { loginSchema } from "@/app/lib/validations"
import { signIn, useSession } from "next-auth/react"

const errorMessages: Record<string, string> = {
  CredentialsSignin: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  OAuthAccountNotLinked: "هذا البريد مسجل بطريقة مختلفة",
  MissingCSRF: "انتهت الجلسة، حاول تحديث الصفحة",
  Configuration: "خطأ في الإعدادات، حاول مرة أخرى",
}

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
      return
    }

    const params = new URLSearchParams(window.location.search)
    const err = params.get("error")
    let msg = ""
    if (err && errorMessages[err]) msg = errorMessages[err]
    else if (err) msg = "حدث خطأ أثناء تسجيل الدخول"

    if (params.get("registered") === "true") msg = "تم إنشاء الحساب بنجاح، سجل دخول الآن"
    if (params.get("existing") === "1") msg = "هذا البريد مسجل بالفعل، سجل دخول"

    if (msg) {
      setTimeout(() => setError(msg), 0)
    }
  }, [status, router])

  if (status === "loading" || status === "authenticated") {
    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    const validation = loginSchema.safeParse({ email, password })
    if (!validation.success) {
      setError(validation.error.issues[0].message)
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) setError(errorMessages[result.error] || "بيانات الدخول غير صحيحة")
      else window.location.href = "/dashboard"
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-2 sm:px-4" dir="rtl">
      <div className="flex justify-end pt-3 px-2 sm:px-4">
        <ThemeToggle iconOnly />
      </div>
      <div className="flex items-center justify-center px-2 sm:px-4" style={{ minHeight: "calc(100vh - 60px)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold"><span className="text-gradient-gold">قسطك</span></h1>
          <p className="text-sm text-muted-foreground mt-1">منصة إدارة التقسيط الذكية</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card !p-4 sm:!p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center text-foreground">تسجيل الدخول</h2>

          {error && (
            <div className={`text-sm rounded-lg p-3 text-center border ${
              error.includes("تم إنشاء") || error.includes("مسجل بالفعل")
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              dir="ltr"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              dir="ltr"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full text-center !py-3"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              إنشاء حساب
            </Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  )
}
