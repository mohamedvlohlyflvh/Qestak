"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SemanticSearch } from "@/components/semantic-search"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 max-w-full">
        <div className="glass-header px-2 sm:px-6 py-1.5 sm:py-3 flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
        </div>
      </main>
    </>
  )
}
