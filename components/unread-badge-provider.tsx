"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function UnreadBadgeProvider({ initialCount }: { initialCount: number }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications/unread-count")
        if (res.ok) {
          const { count } = await res.json()
          const badge = document.getElementById("unread-badge")
          if (badge) {
            if (count > 0) {
              badge.textContent = count > 99 ? "99+" : String(count)
              badge.classList.remove("hidden")
            } else {
              badge.classList.add("hidden")
            }
          }
        }
      } catch {
        // silent
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [router])

  return null
}
