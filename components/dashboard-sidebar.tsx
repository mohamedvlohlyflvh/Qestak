"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { DashboardNav } from "@/app/dashboard/dashboard-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/components/sign-out-button"

export function DashboardSidebar() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden fixed top-3 right-3 z-[101] glass-card !p-2.5"
        aria-label="فتح القائمة"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        ref={ref}
        className={`fixed top-0 bottom-0 right-0 z-50 w-64 glass-card !rounded-none !border-l !border-r-0 flex flex-col shrink-0 transition-transform duration-300 ease-out md:static md:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}
        dir="rtl"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            <span className="text-gradient-gold">قسطك</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
            aria-label="إغلاق القائمة"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DashboardNav />
        </div>

        <div className="p-3 border-t border-border space-y-1">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </aside>
    </>
  )
}
