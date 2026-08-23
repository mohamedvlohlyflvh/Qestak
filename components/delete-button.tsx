"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getCustomersLocal, deleteCustomerLocal } from "@/app/lib/dexie-service"

export function DeleteCustomerButton({ id }: { id: string; name: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!session?.user?.id) return
    setLoading(true)

    try {
      const all = await getCustomersLocal(session.user.id)
      const found = all.find(c => c.serverId === id || String(c.id) === id)
      
      if (found?.id) {
        const result = await deleteCustomerLocal(found.id)
        if (result.error) {
          alert(result.error)
          setLoading(false)
          return
        }
      }
      
      router.push("/dashboard/customers")
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'خطأ غير معروف'
      alert(msg)
      setLoading(false)
    }
  }

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="text-xs text-destructive hover:underline font-medium">
        حذف
      </button>
    )
  }

  return (
    <span className="text-xs text-muted-foreground">
      متأكد؟{" "}
      <button onClick={handleDelete} disabled={loading} className="text-destructive hover:underline font-medium">
        {loading ? "..." : "نعم، احذف"}
      </button>
      {" / "}
      <button onClick={() => setConfirm(false)} className="text-primary hover:underline">
        إلغاء
      </button>
    </span>
  )
}
