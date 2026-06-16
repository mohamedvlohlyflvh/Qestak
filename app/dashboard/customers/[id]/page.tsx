import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getCustomer } from "@/app/actions/customers"
import { calculateCreditScore, getCreditGradeColor } from "@/app/lib/credit-score"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { ContractBadge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DeleteCustomerButton } from "@/components/delete-button"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const customer = await getCustomer(id)
  if (!customer) notFound()

  const allInstallments = customer.contracts.flatMap((c) => c.installments || [])
  const creditScore = calculateCreditScore({
    totalContracts: customer.contracts.length,
    completedContracts: customer.contracts.filter((c) => c.status === "COMPLETED").length,
    totalInstallments: allInstallments.length,
    paidOnTime: allInstallments.filter((i) => i.status === "PAID").length + allInstallments.filter((i) => i.status === "PARTIAL").length,
    latePayments: allInstallments.filter((i) => i.status === "OVERDUE").length,
    defaultedInstallments: 0,
    averagePaymentDelayDays: 0,
    monthsSinceFirstContract: customer.contracts.length > 0
      ? Math.max(1, Math.floor((Date.now() - new Date(Math.min(...customer.contracts.map((c) => new Date(c.createdAt).getTime()))).getTime()) / 2592000000))
      : 0,
  })

  return (
    <div dir="rtl">
      <div className="mb-6">
        <Link href="/dashboard/customers" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← العودة إلى العملاء
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
          <div className="flex gap-2 items-center">
            <Link href={`/dashboard/customers/${customer.id}/edit`} className="btn-glass !py-1.5 !px-3 text-xs">تعديل</Link>
            <DeleteCustomerButton id={customer.id} name={customer.name} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">معلومات العميل</h2>
            <dl className="space-y-2 text-sm">
              <InfoRow label="رقم الهوية" value={customer.nationalId} />
              <InfoRow label="الهاتف" value={customer.phone} />
              <InfoRow label="العنوان" value={customer.address} />
              <InfoRow label="الوظيفة" value={customer.jobTitle || "—"} />
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">التصنيف الائتماني</h2>
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${creditScore.color}/20`}>
                <span className={`${creditScore.color.replace("bg-", "text-")}`}>{creditScore.grade}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{creditScore.label}</p>
                <p className="text-xs text-muted-foreground">درجة {creditScore.score} — تصنيف ائتماني ذكي</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Table>
            <div className="p-4 border-b border-border bg-[var(--color-primary)]/5 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">العقود</h2>
              <Link href={`/dashboard/contracts/new?customerId=${customer.id}`} className="btn-gold !py-1.5 !px-3 text-xs">
                + عقد جديد
              </Link>
            </div>

            {customer.contracts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">لا توجد عقود لهذا العميل</div>
            ) : (
              <TableWrapper><TableInner>
                <THead>
                  <Th>رقم العقد</Th>
                  <Th>المبلغ</Th>
                  <Th className="text-center">الأقساط</Th>
                  <Th className="text-center">الحالة</Th>
                  <Th className="text-center">التاريخ</Th>
                </THead>
                <TBody>
                  {customer.contracts.map((c) => (
                    <TRow key={c.id}>
                      <Td className="font-medium text-foreground">{c.contractNumber}</Td>
                      <Td className="text-muted-foreground">{(c.totalAmount / 100).toLocaleString("ar-EG")} ج.م</Td>
                      <Td className="text-center text-muted-foreground">{c._count.installments}</Td>
                      <Td className="text-center"><ContractBadge status={c.status} /></Td>
                      <Td className="text-center text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString("ar-EG")}</Td>
                    </TRow>
                  ))}
                </TBody>
              </TableInner></TableWrapper>
            )}
          </Table>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-foreground ${dir === "ltr" ? "font-mono text-xs" : ""}`} dir={dir}>{value}</dd>
    </div>
  )
}
