"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

let cachedAuthed: boolean | null = null
const listeners: Set<(v: boolean) => void> = new Set()

function useAuthed() {
  const [authed, setAuthed] = useState<boolean | null>(cachedAuthed)

  useEffect(() => {
    if (cachedAuthed !== null) return

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        cachedAuthed = !!data?.user
        setAuthed(cachedAuthed)
        listeners.forEach((fn) => fn(cachedAuthed!))
      })
      .catch(() => {
        cachedAuthed = false
        setAuthed(false)
      })
  }, [])

  return authed
}

export function LandingHeader() {
  const authed = useAuthed()

  if (authed === null) {
    return <div className="flex gap-3"><div className="w-24 h-9 bg-muted rounded-lg animate-pulse" /></div>
  }

  return (
    <div className="flex gap-3">
      {authed ? (
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          لوحة التحكم
        </Link>
      ) : (
        <>
          <Link href="/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">دخول</Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">بدء الاستخدام</Link>
        </>
      )}
    </div>
  )
}

export function LandingHeroCta() {
  const authed = useAuthed()

  if (authed === null) {
    return <div className="flex justify-center gap-4"><div className="w-32 h-12 bg-muted rounded-xl animate-pulse" /><div className="w-32 h-12 bg-muted rounded-xl animate-pulse" /></div>
  }

  return (
    <div className="flex justify-center gap-4">
      {authed ? (
        <Link
          href="/dashboard"
          className="px-8 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          افتح لوحة التحكم
        </Link>
      ) : (
        <>
          <Link
            href="/register"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            ابدأ مجاناً
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            تسجيل الدخول
          </Link>
        </>
      )}
    </div>
  )
}
