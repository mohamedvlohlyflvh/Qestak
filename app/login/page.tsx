"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { loginSchema } from "@/app/lib/validations"
import { signIn } from "next-auth/react"

const errorMessages: Record<string, string> = {
  CredentialsSignin: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  OAuthAccountNotLinked: "هذا البريد مسجل بطريقة مختلفة",
  OAuthSignin: "حدث خطأ أثناء تسجيل الدخول بحساب Google",
  OAuthCallback: "حدث خطأ أثناء تسجيل الدخول بحساب Google",
  MissingCSRF: "انتهت الجلسة، حاول تحديث الصفحة",
  Configuration: "خطأ في الإعدادات، حاول مرة أخرى",
}

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get("error")
    if (err && errorMessages[err]) setError(errorMessages[err])
    else if (err) setError("حدث خطأ أثناء تسجيل الدخول")

    if (params.get("registered") === "true") setError("تم إنشاء الحساب بنجاح، سجل دخول الآن")
  }, [])

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

  function handleGoogle() {
    const form = formRef.current
    if (!form) return
    const csrf = form.querySelector<HTMLInputElement>("input[name=csrfToken]")
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "csrfToken"
    input.value = csrf?.value || ""
    const googleForm = document.createElement("form")
    googleForm.method = "POST"
    googleForm.action = "/api/auth/signin/google"
    googleForm.appendChild(input)
    document.body.appendChild(googleForm)
    googleForm.submit()
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

        <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center text-foreground">تسجيل الدخول</h2>

          {error && (
            <div className={`text-sm rounded-lg p-3 text-center border ${
              error.includes("تم إنشاء")
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}>
              {error}
            </div>
          )}

          <input type="hidden" name="csrfToken" defaultValue="__placeholder__" />

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

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">أو</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>تسجيل الدخول بحساب Google</span>
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
