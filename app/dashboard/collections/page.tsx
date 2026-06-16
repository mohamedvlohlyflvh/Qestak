import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getCollections } from "@/app/actions/collections"
import { getCollectionColor } from "@/app/lib/collection-score"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { StatCard } from "@/components/ui/kpi-card"
import { PageHeader } from "@/components/ui/page-header"

export default async function CollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const collections = await getCollections()

  const criticalCount = collections.filter((c) => c.score.priority === "critical").length
  const highCount = collections.filter((c) => c.score.priority === "high").length
  const totalOverdueCents = collections.reduce((s, c) => s + c.overdueCents, 0)

  return (
    <div dir="rtl">
      <PageHeader
        title="التحصيل الذكي"
        description="أولويات التحصيل المبنية على تحليل سلوك الدفع"
        actions={<></>}
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
          <p className="kpi-value">{totalOverdueCents.toLocaleString("ar-EG")} ج.م</p>
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
                    <Td><span className="text-foreground">{((c.totalCents - c.paidCents) / 100).toLocaleString("ar-EG")} ج.م</span></Td>
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
