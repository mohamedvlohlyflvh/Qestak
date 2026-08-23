"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getContractsLocal, getInstallmentsLocal } from "@/app/lib/dexie-service"
import { DexieContract, DexieInstallment } from "@/app/lib/dexie-db"
import { CollectionChart } from "./collection-chart"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<DexieContract[]>([])
  const [installments, setInstallments] = useState<DexieInstallment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (!session?.user?.id) return

    const uid = session.user.id

    async function loadData() {
      try {
        const localContracts = await getContractsLocal(uid)
        const localInstallments = await getInstallmentsLocal()
        // Scope installments to this merchant's contracts only
        const contractIds = new Set(localContracts.map((c) => c.id))
        const scopedInstallments = localInstallments.filter(
          (i) => i.contractId !== undefined && contractIds.has(i.contractId)
        )
        setContracts(localContracts)
        setInstallments(scopedInstallments)
      } catch (err) {
        console.error("Error loading local data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
  }

  if (!session) return null

  const totalCapital = contracts.reduce((s, c) => s + c.totalAmount, 0)

  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const upcomingCollections = installments
    .filter((i) => i.status === "UPCOMING" && new Date(i.dueDate) >= now && new Date(i.dueDate) <= nextWeek)
    .reduce((s, i) => s + i.amount, 0)

  const totalCollected = installments
    .filter((i) => i.status === "PAID" || i.status === "PARTIAL")
    .reduce((s, i) => s + (i.amountPaid || 0), 0)

  const overdue = installments
    .filter((i) => i.status === "OVERDUE")
    .reduce((s, i) => s + i.amount, 0)

  const delinquentRatio = totalCapital > 0 ? Math.round((overdue / totalCapital) * 100) : 0

  const statusCounts = { PAID: 0, UPCOMING: 0, OVERDUE: 0, PARTIAL: 0 }
  installments.forEach((i) => {
    if (i.status in statusCounts) {
      statusCounts[i.status as keyof typeof statusCounts]++
    }
  })

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  const chartData = months.map((name, idx) => {
    const monthStart = new Date(now.getFullYear(), idx, 1)
    const monthEnd = new Date(now.getFullYear(), idx + 1, 1)
    const actual = installments
      .filter((i) => (i.status === "PAID" || i.status === "PARTIAL") && i.paidDate && new Date(i.paidDate) >= monthStart && new Date(i.paidDate) < monthEnd)
      .reduce((s, i) => s + (i.amountPaid || i.amount), 0)
    const projected = installments
      .filter((i) => new Date(i.dueDate) >= monthStart && new Date(i.dueDate) < monthEnd)
      .reduce((s, i) => s + i.amount, 0)
    return { name, projected: Math.round(projected), actual: Math.round(actual) }
  })

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          مرحباً، {((session?.user as { name?: string; storeName?: string })?.name || (session?.user as { storeName?: string })?.storeName || session?.user?.email || "")}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
            {(session.user as { merchantId?: string })?.merchantId || "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KpiCard label="رأس المال الموزع" value={`${totalCapital.toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="المتحصلات المتوقعة (أسبوع)" value={`${upcomingCollections.toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="المحصل فعلياً" value={`${totalCollected.toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="نسبة المتعثرات" value={`${delinquentRatio}%`} danger={delinquentRatio > 20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2 glass-card !p-4 sm:!p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">المتحصلات الشهرية</h2>
          <CollectionChart data={chartData} />
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">حالة الأقساط</h2>
          <div className="space-y-4">
            <StatusRow label="مدفوع" count={statusCounts.PAID} color="bg-emerald-500" total={installments.length} />
            <StatusRow label="قادم" count={statusCounts.UPCOMING} color="bg-primary" total={installments.length} />
            <StatusRow label="متأخر" count={statusCounts.OVERDUE} color="bg-destructive" total={installments.length} />
            <StatusRow label="جزئي" count={statusCounts.PARTIAL} color="bg-amber-500" total={installments.length} />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">ملخص سريع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-sm">
          <SummaryItem label="إجمالي العقود" value={contracts.length} />
          <SummaryItem label="العقود النشطة" value={contracts.filter(c => c.status === "ACTIVE").length} />
          <SummaryItem label="العقود المكتملة" value={contracts.filter(c => c.status === "COMPLETED").length} />
          <SummaryItem label="إجمالي الأقساط" value={installments.length} />
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
