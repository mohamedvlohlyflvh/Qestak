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
    <div dir="rtl">
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
          <>
            <div className="sm:hidden space-y-3">
              {customers.map((c) => (
                <div key={c.id} className="glass-card !p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/dashboard/customers/${c.id}`} className="font-bold text-foreground hover:text-primary text-base">{c.name}</Link>
                    <CreditBadge score={c.creditScore} />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>رقم الهوية</span>
                      <span className="font-mono text-xs" dir="ltr">{c.nationalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الهاتف</span>
                      <span dir="ltr">{c.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الوظيفة</span>
                      <span>{c.jobTitle || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>العقود</span>
                      <span>{c._count.contracts}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Link href={`/dashboard/customers/${c.id}`} className="flex-1 text-center text-sm text-primary hover:underline font-medium py-1.5 rounded-lg border border-primary/20">عرض</Link>
                    <DeleteCustomerButton id={c.id} name={c.name} />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
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
            </div>
          </>
        )}
      </Table>
    </div>
  )
}
