"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getCustomersLocal, deleteCustomerLocal } from "@/app/lib/dexie-service";
import { DexieCustomer } from "@/app/lib/dexie-db";
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState<DexieCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    
    let cancelled = false;
    
    async function load() {
      setLoading(true);
      try {
        const data = await getCustomersLocal(userId);
        if (!cancelled) setCustomers(data);
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const interval = setInterval(async () => {
      const data = await getCustomersLocal(userId);
      setCustomers(data);
    }, 5000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل ${name}؟`)) return;
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const result = await deleteCustomerLocal(id);
      if (result.error) {
        alert(result.error);
      } else {
        const data = await getCustomersLocal(userId);
        setCustomers(data);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
      alert(msg);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div dir="rtl">
      <PageHeader
        title="العملاء"
        description="إدارة قاعدة بيانات العملاء"
        actions={
          <Link href="/dashboard/customers/new" className="btn-gold !py-2 !px-4">
            + إضافة عميل
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <Table>
          {customers.length === 0 ? (
            <EmptyState title="لا يوجد عملاء بعد" description="أضف عميلك الأول لبدء إدارة العقود والتقسيط" />
          ) : (
            <>
              <div className="sm:hidden space-y-3">
                {customers.map((c) => (
                  <div key={c.id} className="glass-card !p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/dashboard/customers/${c.serverId || c.id}`} className="font-bold text-foreground hover:text-primary text-base">
                        {c.name}
                      </Link>
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
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Link href={`/dashboard/customers/${c.serverId || c.id}`} className="flex-1 text-center text-sm text-primary hover:underline font-medium py-1.5 rounded-lg border border-primary/20">
                        عرض
                      </Link>
                      <button
                        onClick={() => c.id && handleDelete(c.id, c.name)}
                        className="text-sm text-red-600 hover:underline font-medium py-1.5 px-3 rounded-lg border border-red-200"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <TableWrapper>
                  <TableInner>
                    <THead>
                      <Th>الاسم</Th>
                      <Th>رقم الهوية</Th>
                      <Th>الهاتف</Th>
                      <Th>الوظيفة</Th>
                      <Th className="text-left"></Th>
                    </THead>
                    <TBody>
                      {customers.map((c) => (
                        <TRow key={c.id}>
                          <Td className="font-medium text-foreground">
                            <Link href={`/dashboard/customers/${c.serverId || c.id}`} className="hover:text-primary">
                              {c.name}
                            </Link>
                          </Td>
                          <Td className="text-muted-foreground font-mono text-xs" dir="ltr">{c.nationalId}</Td>
                          <Td className="text-muted-foreground" dir="ltr">{c.phone}</Td>
                          <Td className="text-muted-foreground">{c.jobTitle || "—"}</Td>
                          <Td className="text-left">
                            <Link href={`/dashboard/customers/${c.serverId || c.id}`} className="text-primary hover:underline text-xs font-medium ml-2">
                              عرض
                            </Link>
                            <button
                              onClick={() => c.id && handleDelete(c.id, c.name)}
                              className="text-red-600 hover:underline text-xs font-medium"
                            >
                              حذف
                            </button>
                          </Td>
                        </TRow>
                      ))}
                    </TBody>
                  </TableInner>
                </TableWrapper>
              </div>
            </>
          )}
        </Table>
      )}
    </div>
  );
}
