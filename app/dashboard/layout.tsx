import { DashboardShell } from "./dashboard-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh" dir="rtl">
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
