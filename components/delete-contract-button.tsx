"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteContract } from "@/app/actions/contracts"

export function DeleteContractButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteContract(id)
    if (result.error) {
      alert(result.error)
      setLoading(false)
      return
    }
    router.push("/dashboard/contracts")
    router.refresh()
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
