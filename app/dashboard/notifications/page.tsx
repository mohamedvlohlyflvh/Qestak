import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getNotifications } from "@/app/actions/notifications"
import { NotificationActions } from "./notification-actions"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"

const priorityStyles: Record<string, string> = {
  HIGH: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  MEDIUM: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  LOW: "bg-muted/50 border-border",
}

const priorityIcons: Record<string, string> = {
  HIGH: "🔴",
  MEDIUM: "🟡",
  LOW: "🟢",
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const notifications = await getNotifications()
  const unread = notifications.filter((n) => !n.isRead).length

  return (
    <div className="px-4 sm:px-6" dir="rtl">
      <PageHeader
        title="الإشعارات"
        description={unread > 0 ? `${unread} إشعارات غير مقروءة` : "جميع الإشعارات مقروءة"}
        actions={unread > 0 ? <NotificationActions /> : undefined}
      />

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState title="لا توجد إشعارات" description="سيتم عرض الإشعارات هنا عند حدوث أحداث جديدة" />
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-card !p-4 transition-all ${n.isRead ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{priorityIcons[n.priority] || "🔵"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-semibold text-sm ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(n.createdAt).toLocaleDateString("ar-EG", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
