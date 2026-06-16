import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getContracts } from "@/app/actions/contracts"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { ContractBadge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { DeleteContractButton } from "@/components/delete-contract-button"

export default async function ContractsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const contracts = await getContracts()

  return (
    <div dir="rtl">
      <PageHeader
        title="العقود"
        description="إدارة عقود التقسيط"
        actions={
          <>
            <Link href="/dashboard/contracts/new" className="btn-gold !py-2 !px-4 inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              عقد جديد
            </Link>
          </>
        }
      />

      <Table>
        {contracts.length === 0 ? (
          <EmptyState
            title="لا توجد عقود بعد"
            description="أنشئ عقد تقسيط جديد لبدء المتابعة"
            action={
              <Link href="/dashboard/contracts/new" className="btn-gold !py-2 !px-4">
                + عقد جديد
              </Link>
            }
          />
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="glass-card !p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-foreground">{c.contractNumber}</div>
                      <div className="text-foreground font-medium">{c.customer.name}</div>
                    </div>
                    <ContractBadge status={c.status} />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>المبلغ</span>
                      <span className="text-foreground font-medium">{(c.totalAmount / 100).toLocaleString("ar-EG")} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المتبقي</span>
                      <span>{(c.remainingAmount / 100).toLocaleString("ar-EG")} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الأقساط</span>
                      <span>{c._count.installments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التاريخ</span>
                      <span className="text-xs">{new Date(c.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Link href={`/dashboard/contracts/${c.id}`} className="flex-1 text-center text-sm text-primary hover:underline font-medium py-1.5 rounded-lg border border-primary/20">عرض</Link>
                    <DeleteContractButton id={c.id} />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <TableWrapper>
                <TableInner>
                  <THead>
                    <Th>رقم العقد</Th>
                    <Th>العميل</Th>
                    <Th>المبلغ</Th>
                    <Th>المتبقي</Th>
                    <Th className="text-center">الأقساط</Th>
                    <Th className="text-center">الحالة</Th>
                    <Th className="text-center">التاريخ</Th>
                    <Th className="text-left"></Th>
                    <Th className="text-left"></Th>
                  </THead>
                  <TBody>
                    {contracts.map((c) => (
                      <TRow key={c.id}>
                        <Td className="font-mono text-xs font-medium text-foreground">{c.contractNumber}</Td>
                        <Td className="text-foreground">{c.customer.name}</Td>
                        <Td className="text-muted-foreground">{(c.totalAmount / 100).toLocaleString("ar-EG")} ج.م</Td>
                        <Td className="text-muted-foreground">{(c.remainingAmount / 100).toLocaleString("ar-EG")} ج.م</Td>
                        <Td className="text-center text-muted-foreground">{c._count.installments}</Td>
                        <Td className="text-center"><ContractBadge status={c.status} /></Td>
                        <Td className="text-center text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString("ar-EG")}</Td>
                        <Td className="text-left"><Link href={`/dashboard/contracts/${c.id}`} className="text-primary hover:underline text-xs font-medium">عرض</Link></Td>
                        <Td className="text-left"><DeleteContractButton id={c.id} /></Td>
                      </TRow>
                    ))}
                  </TBody>
                </TableInner>
              </TableWrapper>
            </div>
          </>
        )}
      </Table>
    </div>
  )
}
