"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          const { csrfToken } = await fetch("/api/auth/csrf").then((r) => r.json())
          await fetch("/api/auth/signout", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ csrfToken }),
          })
        } catch {
          // fallback
        }
        router.push("/")
        router.refresh()
      }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {pending ? "جاري..." : "تسجيل الخروج"}
    </button>
  )
}
