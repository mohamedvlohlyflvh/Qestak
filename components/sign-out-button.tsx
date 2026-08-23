"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { clearMerchantData } from "@/app/lib/dexie-service"

export function SignOutButton() {
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          // Clear only THIS merchant's local Dexie data
          if (session?.user?.id) {
            await clearMerchantData(session.user.id)
          }

          const { csrfToken } = await fetch("/api/auth/csrf").then((r) => r.json())
          const res = await fetch("/api/auth/signout", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ csrfToken }),
          })
          if (res.ok) {
            router.push("/")
          }
        } catch {
          router.push("/")
        }
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm text-error hover:bg-error-container/50 transition-colors w-full disabled:opacity-38"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {pending ? "جاري..." : "تسجيل الخروج"}
    </button>
  )
}
