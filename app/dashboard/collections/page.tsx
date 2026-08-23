"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getContractsLocal, getInstallmentsLocal, getCustomersLocal } from "@/app/lib/dexie-service"
import { calculateCollectionScore, getCollectionColor } from "@/app/lib/collection-score"
import type { CollectionScoreResult } from "@/app/lib/collection-score"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"

interface CollectionItem {
  contractId: string
  contractNumber: string
  customerName: string
  customerPhone: string
  totalCents: number
  paidCents: number
  overdueCents: number
  daysOverdue: number
  totalInstallments: number
  paidInstallments: number
  missedCount: number
  daysSinceLastPayment: number | null
  score: CollectionScoreResult
}

export default function CollectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (!session?.user?.id) return

    const uid = session.user.id

    async function load() {
      try {
        const [localContracts, localInstallments, localCustomers] = await Promise.all([
          getContractsLocal(uid),
          getInstallmentsLocal(),
          getCustomersLocal(uid)
        ])

        const customerById = new Map(localCustomers.map(c => [String(c.id), c]))
        const customerByServerId = new Map(localCustomers.filter(c => c.serverId).map(c => [c.serverId!, c]))

        const now = new Date()
        const result: CollectionItem[] = []

        for (const c of localContracts) {
          const contractInstallments = localInstallments.filter(
            i => i.contractId === c.id || i.contractServerId === c.serverId
          )
          const overdue = contractInstallments.filter(
            i => i.status === "OVERDUE" || (i.status === "UPCOMING" && new Date(i.dueDate) < now)
          )
          const paid = contractInstallments.filter(i => i.status === "PAID" || i.status === "PARTIAL")

          const daysSinceLastPayment = paid.length > 0
            ? Math.floor((now.getTime() - Math.max(...paid.map(i => (i.paidDate || i.dueDate).getTime()))) / 86400000)
            : null

          const maxOverdueDays = overdue.length > 0
            ? Math.floor((now.getTime() - Math.min(...overdue.map(i => i.dueDate.getTime()))) / 86400000)
            : 0

          const customer = (c.customerId !== undefined ? customerById.get(String(c.customerId)) : undefined)
            ?? (c.customerServerId ? customerByServerId.get(c.customerServerId) : undefined)

          const score = calculateCollectionScore({
            daysOverdue: maxOverdueDays,
            totalInstallments: contractInstallments.length,
            paidInstallments: paid.length,
            totalAmountCents: c.totalAmount,
            paidAmountCents: paid.reduce((s, i) => s + i.amountPaid, 0),
            missedCount: overdue.length,
            daysSinceLastPayment,
          })

          result.push({
            contractId: c.serverId || String(c.id),
            contractNumber: c.contractNumber,
            customerName: c.customerName || "—",
            customerPhone: customer?.phone || "",
            totalCents: c.totalAmount,
            paidCents: paid.reduce((s, i) => s + i.amountPaid, 0),
            overdueCents: overdue.reduce((s, i) => s + i.amount, 0),
            daysOverdue: maxOverdueDays,
            totalInstallments: contractInstallments.length,
            paidInstallments: paid.length,
            missedCount: overdue.length,
            daysSinceLastPayment,
            score,
          })
        }

        result.sort((a, b) => b.score.score - a.score.score)
        setCollections(result)
      } catch (err) {
        console.error("Error loading collections:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
  }

  if (!session) return null

  const criticalCount = collections.filter(c => c.score.priority === "critical").length
  const highCount = collections.filter(c => c.score.priority === "high").length
  const totalOverdueCents = collections.reduce((s, c) => s + c.overdueCents, 0)

  return (
    <div dir="rtl">
      <PageHeader
        title="التحصيل الذكي"
        description="أولويات التحصيل المبنية على تحليل سلوك الدفع"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="kpi-glass !border-red-500/30">
          <p className="kpi-label">حرج</p>
          <p className="kpi-value !text-red-500">{criticalCount}</p>
        </div>
        <div className="kpi-glass !border-amber-500/30">
          <p className="kpi-label">عالي</p>
          <p className="kpi-value !text-amber-500">{highCount}</p>
        </div>
        <div className="kpi-glass">
          <p className="kpi-label">متأخر</p>
          <p className="kpi-value">{(totalOverdueCents).toLocaleString("ar-EG")} ج.م</p>
        </div>
      </div>

      <Table>
        <TableWrapper>
          <TableInner>
            <THead>
              <Th>العميل</Th>
              <Th>العقد</Th>
              <Th>المتبقي</Th>
              <Th>أيام</Th>
              <Th>الأقساط</Th>
              <Th>الأولوية</Th>
              <Th> </Th>
            </THead>
            <TBody>
              {collections.length === 0 ? (
                <TRow noHover><Td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">لا توجد عقود تحت التحصيل حالياً</Td></TRow>
              ) : (
                collections.map((c) => (
                  <TRow key={c.contractId}>
                    <Td>
                      <span className="text-foreground font-medium">{c.customerName}</span>
                      <p className="text-xs text-muted-foreground">{c.customerPhone}</p>
                    </Td>
                    <Td className="text-muted-foreground">{c.contractNumber}</Td>
                    <Td><span className="text-foreground">{(c.totalCents - c.paidCents).toLocaleString("ar-EG")} ج.م</span></Td>
                    <Td>
                      <span className={`font-medium ${c.daysOverdue > 30 ? "text-destructive" : c.daysOverdue > 7 ? "text-amber-500" : "text-muted-foreground"}`}>
                        {c.daysOverdue} يوم
                      </span>
                    </Td>
                    <Td className="text-muted-foreground">{c.paidInstallments}/{c.totalInstallments}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getCollectionColor(c.score.priority)}`} />
                        <span className="text-xs font-medium text-muted-foreground">{c.score.label}</span>
                        <span className="text-[10px] text-muted-foreground">({c.score.score})</span>
                      </div>
                    </Td>
                    <Td><Link href={`/dashboard/contracts/${c.contractId}`} className="text-xs text-primary hover:underline">عرض</Link></Td>
                  </TRow>
                ))
              )}
            </TBody>
          </TableInner>
        </TableWrapper>
      </Table>
    </div>
  )
}
