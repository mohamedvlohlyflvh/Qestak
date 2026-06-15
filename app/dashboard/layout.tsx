import { getUnreadCount } from "@/app/actions/notifications"
import { SemanticSearch } from "@/components/semantic-search"
import { UnreadBadgeProvider } from "@/components/unread-badge-provider"
import { PushNotificationHandler } from "@/components/push-notification"
import { ThemeToggle } from "@/components/theme-toggle"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CronChecker } from "@/components/cron-checker"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadCount()

  return (
    <div className="flex min-h-dvh" dir="rtl">
      <CronChecker />
      <DashboardSidebar />

      <UnreadBadgeProvider initialCount={unreadCount} />
      <PushNotificationHandler />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="glass-header px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
          <SemanticSearch />
          <ThemeToggle iconOnly />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
