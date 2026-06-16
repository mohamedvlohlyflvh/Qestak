import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getContract, updateInstallmentStatus } from "@/app/actions/contracts"
import { InstallmentActions } from "./installment-actions"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { InstallmentBadge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card } from "@/components/ui/card"
import { OverdueBanner } from "@/components/ui/card"
import { DeleteContractButton } from "@/components/delete-contract-button"

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const contract = await getContract(id)
  if (!contract) notFound()

  const totalPaid = contract.installments
    .filter((i) => i.status === "PAID" || i.status === "PARTIAL")
    .reduce((sum, i) => sum + (i.amountPaid || 0), 0)

  const overdueCount = contract.installments.filter((i) => i.status === "OVERDUE").length

  return (
    <div dir="rtl">
      <div className="mb-6">
        <Link href="/dashboard/contracts" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← العودة إلى العقود
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">عقد {contract.contractNumber}</h1>
          <div className="flex gap-2 items-center">
            <Link href={`/dashboard/contracts/${id}/edit`} className="btn-glass !py-1.5 !px-3 text-xs">تعديل</Link>
            <DeleteContractButton id={id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <KpiCard label="العميل" value={contract.customer.name} />
        <KpiCard label="المبلغ الإجمالي" value={`${(contract.totalAmount / 100).toLocaleString("ar-EG")} ج.م`} />
        <KpiCard label="المتبقي" value={`${(contract.remainingAmount / 100 - totalPaid / 100).toLocaleString("ar-EG")} ج.م`} />
        {contract.interestRate && (
          <KpiCard label="نسبة الفائدة" value={`${contract.interestRate}%`} />
        )}
      </div>

      {contract.guarantor && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">الضامن</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-xs text-muted-foreground">الاسم</p><p className="text-foreground font-medium">{contract.guarantor.name}</p></div>
            <div><p className="text-xs text-muted-foreground">رقم الهوية</p><p className="text-muted-foreground font-mono text-xs" dir="ltr">{contract.guarantor.nationalId}</p></div>
            <div><p className="text-xs text-muted-foreground">الهاتف</p><p className="text-muted-foreground" dir="ltr">{contract.guarantor.phone}</p></div>
            <div><p className="text-xs text-muted-foreground">العنوان</p><p className="text-muted-foreground">{contract.guarantor.address || "—"}</p></div>
          </div>
        </Card>
      )}

      {overdueCount > 0 && <OverdueBanner count={overdueCount} />}

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
            {contract.installments.map((inst, i) => (
              <TRow key={inst.id}>
                <Td className="text-muted-foreground font-mono">{i + 1}</Td>
                <Td className="text-foreground">{(inst.amount / 100).toFixed(2)} ج.م</Td>
                <Td className="text-muted-foreground">{(inst.amountPaid > 0 ? inst.amountPaid / 100 : 0).toFixed(2)} ج.م</Td>
                <Td className="text-center text-muted-foreground text-xs">{new Date(inst.dueDate).toLocaleDateString("ar-EG")}</Td>
                <Td className="text-center"><InstallmentBadge status={inst.status} /></Td>
                <Td className="text-center"><InstallmentActions installment={inst} contractId={id} /></Td>
              </TRow>
            ))}
          </TBody>
        </TableInner></TableWrapper>
      </Table>
    </div>
  )
}
