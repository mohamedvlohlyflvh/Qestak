"use client"

import Link from "next/link"
import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { getContractsLocal, getInstallmentsLocal, getGuarantorsLocal } from "@/app/lib/dexie-service"
import { DexieInstallment, DexieGuarantor } from "@/app/lib/dexie-db"
import { InstallmentActions } from "./installment-actions"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { InstallmentBadge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card } from "@/components/ui/card"

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const [contract, setContract] = useState<Awaited<ReturnType<typeof getContractsLocal>>[number] | null>(null)
  const [installments, setInstallments] = useState<DexieInstallment[]>([])
  const [guarantors, setGuarantors] = useState<DexieGuarantor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    async function load() {
      setLoading(true)
      try {
        const all = await getContractsLocal(uid)
        const found = all.find(c => c.serverId === id || String(c.id) === id)
        setContract(found || null)

        if (found?.id) {
          const [insts, guar] = await Promise.all([
            getInstallmentsLocal(found.id),
            getGuarantorsLocal(found.id),
          ])
          setInstallments(insts.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()))
          setGuarantors(guar)
        }
      } catch (error) {
        console.error("Error loading contract:", error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, session?.user?.id])

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
  }

  

  if (!contract) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">لم يتم العثور على العقد</p>
        <Link href="/dashboard/contracts" className="text-primary hover:underline">← العودة إلى العقود</Link>
      </div>
    )
  }

  const paidCount = installments.filter(i => i.status === "PAID").length
  const paidAmount = installments.filter(i => i.status === "PAID" || i.status === "PARTIAL").reduce((s, i) => s + (i.amountPaid || 0), 0)
  const progress = contract.totalAmount > 0 ? Math.round((paidAmount / contract.totalAmount) * 100) : 0

  return (
    <div dir="rtl">
      <div className="mb-6">
        <Link href="/dashboard/contracts" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← العودة إلى العقود
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">عقد {contract.contractNumber}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="العميل" value={contract.customerName || 'عميل'} />
        <KpiCard label="المبلغ الإجمالي" value={`${contract.totalAmount.toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="المتبقي" value={`${(contract.totalAmount - paidAmount).toLocaleString("ar-EG")} ج.م`} />
        {contract.interestRate ? (
          <KpiCard label="نسبة الفائدة" value={`${contract.interestRate}%`} />
        ) : (
          <KpiCard label="الأقساط المدفوعة" value={`${paidCount}/${installments.length}`} />
        )}
        <KpiCard label="المدة بين الأقساط" value={`${contract.installmentInterval || 30} يوم`} />
        {contract.totalPeriodValue && contract.totalPeriodUnit && (
          <KpiCard label="مدة السداد" value={`${contract.totalPeriodValue} ${contract.totalPeriodUnit === "day" ? "يوم" : contract.totalPeriodUnit === "month" ? "شهر" : "سنة"}`} />
        )}
      </div>

      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">نسبة التحصيل</h3>
        <div className="w-full h-2.5 bg-[var(--color-outline-variant)]/30 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          تم تحصيل {paidAmount.toLocaleString("ar-EG")} ج.م من أصل {contract.totalAmount.toLocaleString("ar-EG")} ج.م ({progress}%)
        </p>
      </Card>

      {contract.description && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">وصف العقد</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contract.description}</p>
        </Card>
      )}

      {guarantors.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">الضامن</h3>
          {guarantors.map((g) => (
            <div key={g.id} className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="text-foreground font-medium">{g.name}</span>
              <span className="text-muted-foreground" dir="ltr">رقم الهوية: {g.nationalId}</span>
              <span className="text-muted-foreground" dir="ltr">{g.phone}</span>
              {g.address && <span className="text-muted-foreground">{g.address}</span>}
            </div>
          ))}
        </Card>
      )}

      <Table>
        <div className="p-4 border-b border-border bg-[var(--color-primary)]/5">
          <h2 className="font-semibold text-foreground">جدول الأقساط</h2>
        </div>

        <TableWrapper><TableInner>
          <THead>
            <Th>#</Th>
            <Th>المبلغ</Th>
            <Th>المدفوع</Th>
            <Th className="text-center">تاريخ الاستحقاق</Th>
            <Th className="text-center">الحالة</Th>
            <Th className="text-center">إجراءات</Th>
          </THead>
          <TBody>
            {installments.length === 0 ? (
              <TRow noHover><Td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">لا توجد أقساط مسجلة لهذا العقد</Td></TRow>
            ) : (
              installments.map((inst, i) => (
                <TRow key={inst.id}>
                  <Td className="text-muted-foreground font-mono">{i + 1}</Td>
                  <Td className="text-foreground">{inst.amount.toLocaleString("ar-EG")} ج.م</Td>
                  <Td className="text-muted-foreground">{inst.amountPaid > 0 ? inst.amountPaid.toLocaleString("ar-EG") : 0} ج.م</Td>
                  <Td className="text-center text-muted-foreground text-xs">{new Date(inst.dueDate).toLocaleDateString("ar-EG")}</Td>
                  <Td className="text-center"><InstallmentBadge status={inst.status} /></Td>
                  <Td className="text-center"><InstallmentActions installment={{ id: inst.serverId || String(inst.id), amount: inst.amount, amountPaid: inst.amountPaid, status: inst.status }} contractId={id} contractLocalId={contract.id} contractServerId={contract.serverId} /></Td>
                </TRow>
              ))
            )}
          </TBody>
        </TableInner></TableWrapper>
      </Table>
    </div>
  )
}
