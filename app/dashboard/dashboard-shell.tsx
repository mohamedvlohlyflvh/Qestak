"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SemanticSearch } from "@/components/semantic-search"
import { ThemeToggle } from "@/components/theme-toggle"

const DexieDataWarning = dynamic(() => import("@/components/dexie-data-warning").then(m => ({ default: m.DexieDataWarning })), { ssr: false })

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-1 min-w-0 max-w-full">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 max-w-full">
        <div className="m3-top-app-bar px-2 sm:px-6 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden shrink-0 p-2 rounded-full text-on-surface-variant hover:bg-muted transition-colors"
            aria-label="فتح القائمة"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <SemanticSearch />
          </div>
          <ThemeToggle iconOnly />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="px-2 sm:px-6 py-2 sm:py-6">
            {children}
          </div>
          <DexieDataWarning />
        </div>
      </main>
    </div>
  )
}
