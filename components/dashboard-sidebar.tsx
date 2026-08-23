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
      {/* Scrim overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-scrim/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={ref}
        dir="rtl"
        className={`
          fixed lg:relative
          top-12 sm:top-16 lg:top-0
          right-0 z-50 w-64
          m3-drawer !rounded-none flex-col
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
          ${open ? "flex" : "hidden lg:flex"}
        `}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="text-title-lg font-bold">
            <span className="text-gradient-gold">قسطك</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-full text-on-surface-variant hover:bg-muted transition-colors"
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
