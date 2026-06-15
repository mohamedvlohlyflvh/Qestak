import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/lib/prisma"
import { CollectionChart } from "./collection-chart"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card } from "@/components/ui/card"
import { syncStripeSubscription } from "@/app/lib/stripe"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, storeName: true, plan: true, stripeCustomerId: true },
  })

  if (!user) redirect("/login")

  if (user.plan === "FREE" && user.stripeCustomerId) {
    await syncStripeSubscription(userId, user.stripeCustomerId)
  }

  const contracts = await prisma.contract.findMany({
    where: { merchantId: userId },
    include: { installments: true },
  })

  const totalCapital = contracts.reduce((s, c) => s + c.totalAmount, 0)
  const totalRemaining = contracts.reduce((s, c) => s + c.remainingAmount, 0)
  const totalCollected = contracts
    .flatMap((c) => c.installments)
    .filter((i) => i.status === "PAID" || i.status === "PARTIAL")
    .reduce((s, i) => s + (i.amountPaid || 0), 0)

  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingCollections = contracts
    .flatMap((c) => c.installments)
    .filter((i) => i.status === "UPCOMING" && i.dueDate >= now && i.dueDate <= nextWeek)
    .reduce((s, i) => s + i.amount, 0)

  const overdue = contracts
    .flatMap((c) => c.installments)
    .filter((i) => i.status === "OVERDUE")
    .reduce((s, i) => s + i.amount, 0)

  const delinquentRatio = totalCapital > 0 ? Math.round((overdue / totalCapital) * 100) : 0

  const statusCounts = { PAID: 0, UPCOMING: 0, OVERDUE: 0, PARTIAL: 0 }
  contracts.flatMap((c) => c.installments).forEach((i) => {
    if (statusCounts[i.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[i.status as keyof typeof statusCounts]++
    }
  })

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  const chartData = months.map((name, idx) => {
    const monthStart = new Date(now.getFullYear(), idx, 1)
    const monthEnd = new Date(now.getFullYear(), idx + 1, 1)
    const actual = contracts
      .flatMap((c) => c.installments)
      .filter((i) => (i.status === "PAID" || i.status === "PARTIAL") && i.paidDate && i.paidDate >= monthStart && i.paidDate < monthEnd)
      .reduce((s, i) => s + (i.amountPaid || i.amount), 0)
    const projected = contracts
      .flatMap((c) => c.installments)
      .filter((i) => i.dueDate >= monthStart && i.dueDate < monthEnd)
      .reduce((s, i) => s + i.amount, 0)
    return { name, projected: Math.round(projected / 100), actual: Math.round(actual / 100) }
  })

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          مرحباً، {user.name || user.storeName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.plan === "FREE" ? "الخطة المجانية" : user.plan === "BASIC" ? "الخطة الأساسية" : "الخطة الاحترافية"}
          {user.plan !== "PRO" && (
            <a href="/dashboard/subscription" className="text-primary hover:underline font-medium mr-1">
              — قم بالترقية
            </a>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="رأس المال الموزع" value={`${(totalCapital / 100).toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="المتحصلات المتوقعة (أسبوع)" value={`${(upcomingCollections / 100).toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="المحصل فعلياً" value={`${(totalCollected / 100).toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="نسبة المتعثرات" value={`${delinquentRatio}%`} danger={delinquentRatio > 20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">المتحصلات الشهرية</h2>
          <CollectionChart data={chartData} />
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">حالة الأقساط</h2>
          <div className="space-y-4">
            <StatusRow label="مدفوع" count={statusCounts.PAID} color="bg-emerald-500" total={contracts.reduce((s, c) => s + c.installments.length, 0)} />
            <StatusRow label="قادم" count={statusCounts.UPCOMING} color="bg-primary" total={contracts.reduce((s, c) => s + c.installments.length, 0)} />
            <StatusRow label="متأخر" count={statusCounts.OVERDUE} color="bg-destructive" total={contracts.reduce((s, c) => s + c.installments.length, 0)} />
            <StatusRow label="جزئي" count={statusCounts.PARTIAL} color="bg-amber-500" total={contracts.reduce((s, c) => s + c.installments.length, 0)} />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">ملخص سريع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <SummaryItem label="إجمالي العقود" value={contracts.length} />
          <SummaryItem label="العقود النشطة" value={contracts.filter(c => c.status === "ACTIVE").length} />
          <SummaryItem label="العقود المكتملة" value={contracts.filter(c => c.status === "COMPLETED").length} />
          <SummaryItem label="إجمالي الأقساط" value={contracts.reduce((s, c) => s + c.installments.length, 0)} />
        </div>
      </Card>
    </div>
  )
}

function StatusRow({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="glass-card !p-3 !shadow-none">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{count}</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--color-outline-variant)]/30 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card !p-4 !shadow-none text-center">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-gradient-gold">{value}</p>
    </div>
  )
}
