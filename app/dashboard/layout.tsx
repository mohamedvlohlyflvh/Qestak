import { getUnreadCount } from "@/app/actions/notifications"
import { UnreadBadgeProvider } from "@/components/unread-badge-provider"
import { PushNotificationHandler } from "@/components/push-notification"
import { DashboardShell } from "./dashboard-shell"
import { CronChecker } from "@/components/cron-checker"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadCount()

  return (
    <div className="flex min-h-dvh" dir="rtl">
      <CronChecker />
      <UnreadBadgeProvider initialCount={unreadCount} />
      <PushNotificationHandler />
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
