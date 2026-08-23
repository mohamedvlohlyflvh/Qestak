"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getContractsLocal, deleteContractLocal } from "@/app/lib/dexie-service";
import { DexieContract } from "@/app/lib/dexie-db";
import { Table, TableWrapper, TableInner, THead, Th, TBody, TRow, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ContractBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export default function ContractsPage() {
  const { data: session, status } = useSession();
  const [contracts, setContracts] = useState<DexieContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    
    let cancelled = false;
    
    async function load() {
      setLoading(true);
      try {
        const data = await getContractsLocal(userId);
        if (!cancelled) setContracts(data);
      } catch (error) {
        console.error("Error loading contracts:", error);
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
      const data = await getContractsLocal(userId);
      setContracts(data);
    }, 5000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleDelete = async (id: number, contractNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف العقد ${contractNumber}؟`)) return;
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const result = await deleteContractLocal(id);
      if (result.error) {
        alert(result.error);
      } else {
        const data = await getContractsLocal(userId);
        setContracts(data);
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
        title="العقود"
        description="إدارة عقود التقسيط"
        actions={
          <Link href="/dashboard/contracts/new" className="btn-gold !py-2 !px-4 inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            عقد جديد
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
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
                        <div className="text-foreground font-medium">{c.customerName || 'عميل'}</div>
                      </div>
                      <ContractBadge status={c.status} />
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {c.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mb-1">{c.description}</div>
                      )}
                      <div className="flex justify-between">
                        <span>المبلغ</span>
                        <span className="text-foreground font-medium">{(c.totalAmount).toLocaleString("ar-EG")} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المتبقي</span>
                        <span>{(c.remainingAmount).toLocaleString("ar-EG")} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التاريخ</span>
                        <span className="text-xs">{new Date(c.createdAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Link href={`/dashboard/contracts/${c.serverId || c.id}`} className="flex-1 text-center text-sm text-primary hover:underline font-medium py-1.5 rounded-lg border border-primary/20">
                        عرض
                      </Link>
                      <button
                        onClick={() => c.id && handleDelete(c.id, c.contractNumber)}
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
                      <Th>رقم العقد</Th>
                      <Th>العميل</Th>
                      <Th>الوصف</Th>
                      <Th>المبلغ</Th>
                      <Th>المتبقي</Th>
                      <Th className="text-center">الحالة</Th>
                      <Th className="text-center">التاريخ</Th>
                      <Th className="text-left"></Th>
                    </THead>
                    <TBody>
                      {contracts.map((c) => (
                        <TRow key={c.id}>
                          <Td className="font-mono text-xs font-medium text-foreground">{c.contractNumber}</Td>
                          <Td className="text-foreground">{c.customerName || 'عميل'}</Td>
                          <Td className="text-muted-foreground max-w-[180px] truncate text-xs">{c.description || "—"}</Td>
                          <Td className="text-muted-foreground">{c.totalAmount.toLocaleString("ar-EG")} ج.م</Td>
                          <Td className="text-muted-foreground">{c.remainingAmount.toLocaleString("ar-EG")} ج.م</Td>
                          <Td className="text-center"><ContractBadge status={c.status} /></Td>
                          <Td className="text-center text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString("ar-EG")}</Td>
                          <Td className="text-left">
                            <Link href={`/dashboard/contracts/${c.serverId || c.id}`} className="text-primary hover:underline text-xs font-medium ml-2">
                              عرض
                            </Link>
                            <button
                              onClick={() => c.id && handleDelete(c.id, c.contractNumber)}
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
