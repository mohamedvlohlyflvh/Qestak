"use client"

import Link from "next/link"
import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { getCustomersLocal } from "@/app/lib/dexie-service"
import { DexieCustomer } from "@/app/lib/dexie-db"
import { Card } from "@/components/ui/card"

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const [customer, setCustomer] = useState<DexieCustomer | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    async function load() {
      setLoading(true)
      try {
        const allCustomers = await getCustomersLocal(uid)
        const found = allCustomers.find(c => c.serverId === id || String(c.id) === id)
        setCustomer(found)
      } catch (error) {
        console.error("Error loading customer:", error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, session?.user?.id])

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
  }

  

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">لم يتم العثور على العميل</p>
        <Link href="/dashboard/customers" className="text-primary hover:underline">← العودة إلى العملاء</Link>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <div className="mb-6">
        <Link href="/dashboard/customers" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← العودة إلى العملاء
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
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
