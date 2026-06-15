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
    <div className="px-4 sm:px-6" dir="rtl">
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
        )}
      </Table>
    </div>
  )
}
