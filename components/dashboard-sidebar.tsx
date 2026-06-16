"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { DashboardNav } from "@/app/dashboard/dashboard-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/components/sign-out-button"

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <>
      {open && (
        <div
          className="fixed top-12 sm:top-16 inset-x-0 bottom-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        ref={ref}
        className={`!fixed top-12 sm:top-16 bottom-0 right-0 z-50 w-64 glass-card !rounded-none !border-l !border-r-0 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        dir="rtl"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            <span className="text-gradient-gold">قسطك</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
