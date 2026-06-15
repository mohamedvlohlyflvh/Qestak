"use client"

import { useRouter } from "next/navigation"
import { markAllAsRead } from "@/app/actions/notifications"

export function NotificationActions() {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        await markAllAsRead()
        router.refresh()
      }}
      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-xs font-medium transition-colors"
    >
      تحديد الكل كمقروء
    </button>
  )
}
