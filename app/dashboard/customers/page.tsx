import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getCustomers } from "@/app/actions/customers"
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { CreditBadge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { DeleteCustomerButton } from "@/components/delete-button"

export default async function CustomersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const customers = await getCustomers()

  return (
    <div className="px-4 sm:px-6" dir="rtl">
      <PageHeader
        title="العملاء"
        description="إدارة قاعدة بيانات العملاء"
        actions={
          <>
            <Link href="/dashboard/customers/new" className="btn-gold !py-2 !px-4">
              + إضافة عميل
            </Link>
          </>
        }
      />

      <Table>
        {customers.length === 0 ? (
          <EmptyState title="لا يوجد عملاء بعد" description="أضف عميلك الأول لبدء إدارة العقود والتقسيط" />
        ) : (
          <TableWrapper><TableInner>
            <THead>
              <Th>الاسم</Th>
              <Th>رقم الهوية</Th>
              <Th>الهاتف</Th>
              <Th>الوظيفة</Th>
              <Th className="text-center">العقود</Th>
              <Th className="text-center">التصنيف</Th>
              <Th className="text-left"></Th>
              <Th className="text-left"></Th>
            </THead>
            <TBody>
              {customers.map((c) => (
                <TRow key={c.id}>
                  <Td className="font-medium text-foreground">
                    <Link href={`/dashboard/customers/${c.id}`} className="hover:text-primary">{c.name}</Link>
                  </Td>
                  <Td className="text-muted-foreground font-mono text-xs" dir="ltr">{c.nationalId}</Td>
                  <Td className="text-muted-foreground" dir="ltr">{c.phone}</Td>
                  <Td className="text-muted-foreground">{c.jobTitle || "—"}</Td>
                  <Td className="text-center text-muted-foreground">{c._count.contracts}</Td>
                  <Td className="text-center"><CreditBadge score={c.creditScore} /></Td>
                  <Td className="text-left">
                    <Link href={`/dashboard/customers/${c.id}`} className="text-primary hover:underline text-xs font-medium">عرض</Link>
                  </Td>
                  <Td className="text-left"><DeleteCustomerButton id={c.id} name={c.name} /></Td>
                </TRow>
              ))}
            </TBody>
          </TableInner></TableWrapper>
        )}
      </Table>
    </div>
  )
}
