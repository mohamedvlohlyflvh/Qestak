"use client"

import { useState } from "react"
import { updateInstallmentLocal, getInstallmentsLocal, updateContractLocal, getContractsLocal } from "@/app/lib/dexie-service"

interface Installment {
  id: string
  amount: number
  amountPaid: number
  status: string
}

export function InstallmentActions({ installment, contractId, contractLocalId, contractServerId }: {
  installment: Installment
  contractId: string
  contractLocalId?: number
  contractServerId?: string
}) {
  const [showPartial, setShowPartial] = useState(false)
  const [partialAmount, setPartialAmount] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState<string | null>(null)

  const effectiveStatus = localStatus ?? installment.status

  /** Find the local installment row for this installment + contract. */
  async function findLocalInstallment() {
    const all = await getInstallmentsLocal()
    return all.find(i =>
      (i.serverId === installment.id || String(i.id) === installment.id) &&
      (contractLocalId !== undefined
        ? i.contractId === contractLocalId
        : i.contractServerId === (contractServerId || contractId))
    )
  }

  /** Recompute the contract's remainingAmount from its installments. */
  async function refreshContractRemaining(contractLocalId?: number) {
    if (!contractLocalId) return
    const contract = await getContractsLocal().then(all => all.find(c => c.id === contractLocalId))
    if (!contract) return
    const insts = await getInstallmentsLocal(contractLocalId)
    const paid = insts
      .filter(i => i.status === "PAID" || i.status === "PARTIAL")
      .reduce((s, i) => s + (i.amountPaid || 0), 0)
    const remaining = Math.max(0, Math.round((contract.totalAmount - paid) * 100) / 100)
    await updateContractLocal(contractLocalId, { remainingAmount: remaining })
  }

  if (effectiveStatus === "PAID" || effectiveStatus === "PARTIAL") {
    const label = effectiveStatus === "PAID" ? "✓ مدفوع" : "جزئي"
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <span className={`text-xs ${effectiveStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>{label}</span>
        <button
          onClick={async () => {
            setLoading("revert")
            const found = await findLocalInstallment()
            if (found?.id) {
              const result = await updateInstallmentLocal(found.id, { status: "UPCOMING", amountPaid: 0, paidDate: undefined })
              if (result.success) {
                await refreshContractRemaining(contractLocalId ?? found.contractId)
                setLocalStatus("UPCOMING")
                setTimeout(() => window.location.reload(), 400)
              }
            }
            setLoading(null)
          }}
          disabled={loading === "revert"}
          className={`px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors ${loading === "revert" ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading === "revert" ? "جارٍ..." : "إرجاع"}
        </button>
      </div>
    )
  }

  async function markPaid() {
    setLoading("paid")
    const found = await findLocalInstallment()
    if (found?.id) {
      const result = await updateInstallmentLocal(found.id, {
        status: "PAID",
        amountPaid: installment.amount,
        paidDate: new Date()
      })
      if (result.success) {
        await refreshContractRemaining(contractLocalId ?? found.contractId)
        setLocalStatus("PAID")
        setTimeout(() => window.location.reload(), 400)
      }
    }
    setLoading(null)
  }

  async function markPartial(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(partialAmount)
    if (!amt || amt <= 0) return
    setLoading("partial")

    const found = await findLocalInstallment()
    if (found?.id) {
      const result = await updateInstallmentLocal(found.id, {
        status: "PARTIAL",
        amountPaid: amt,
        paidDate: new Date()
      })
      if (result.success) {
        await refreshContractRemaining(contractLocalId ?? found.contractId)
        setShowPartial(false)
        setPartialAmount("")
        setTimeout(() => window.location.reload(), 400)
      }
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <button
        onClick={markPaid}
        disabled={loading === "paid"}
        className={`px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors ${loading === "paid" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading === "paid" ? "جارٍ..." : "دفع كامل"}
      </button>
      <button
        onClick={() => setShowPartial(!showPartial)}
        disabled={loading === "partial"}
        className={`px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors ${loading === "partial" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading === "partial" ? "جارٍ..." : "دفع جزئي"}
      </button>

      {showPartial && (
        <form onSubmit={markPartial} className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={installment.amount}
            placeholder="المبلغ"
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            className="w-20 px-1.5 py-1 border border-border rounded text-xs bg-background text-foreground"
          />
          <button
            type="submit"
            disabled={loading === "partial"}
            className={`px-2 py-1 bg-primary text-primary-foreground rounded text-xs ${loading === "partial" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading === "partial" ? "جارٍ..." : "حفظ"}
          </button>
        </form>
      )}
    </div>
  )
}
