"use client"

import { useEffect, useRef } from "react"

export function PushNotificationHandler() {
  const lastCount = useRef(0)

  useEffect(() => {
    if (!("Notification" in window)) return
    if (Notification.permission === "default") Notification.requestPermission()

    const evtSource = new EventSource("/api/notifications/stream")

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "new" && Notification.permission === "granted") {
          new Notification("قسطك — إشعار جديد", {
            body: data.notification.title,
            icon: "/favicon.ico",
          })
        }

        if (data.type === "count") {
          const count = data.unread
          if (count > lastCount.current && lastCount.current > 0 && Notification.permission === "granted") {
            new Notification("قسطك — إشعار جديد", {
              body: `لديك ${count - lastCount.current} إشعارات غير مقروءة`,
              icon: "/favicon.ico",
            })
          }
          lastCount.current = count
        }
      } catch {
        // ignore parse errors
      }
    }

    return () => evtSource.close()
  }, [])

  return null
}
