"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateInstallmentStatus } from "@/app/actions/contracts"

interface Installment {
  id: string
  amount: number
  amountPaid: number
  status: string
}

export function InstallmentActions({ installment }: { installment: Installment; contractId: string }) {
  const router = useRouter()
  const [showPartial, setShowPartial] = useState(false)
  const [partialAmount, setPartialAmount] = useState("")

  if (installment.status === "PAID") return <span className="text-emerald-600 text-xs">✓ مدفوع</span>

  async function markPaid() {
    const result = await updateInstallmentStatus(installment.id, "PAID")
    if (result.success) router.refresh()
  }

  async function markPartial(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(partialAmount)
    if (!amt || amt <= 0) return
    const result = await updateInstallmentStatus(installment.id, "PARTIAL", amt)
    if (result.success) { setShowPartial(false); router.refresh() }
  }

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <button onClick={markPaid} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
        دفع كامل
      </button>
      <button onClick={() => setShowPartial(!showPartial)} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
        دفع جزئي
      </button>

      {showPartial && (
        <form onSubmit={markPartial} className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={installment.amount / 100}
            placeholder="المبلغ"
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            className="w-20 px-1.5 py-1 border border-border rounded text-xs bg-background text-foreground"
          />
          <button type="submit" className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">حفظ</button>
        </form>
      )}
    </div>
  )
}