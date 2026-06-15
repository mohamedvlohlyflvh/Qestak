"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateContract } from "@/app/actions/contracts"
import { PageHeader } from "@/components/ui/page-header"
import { Label, Input, Select, ErrorBanner, Button } from "@/components/ui/card"

interface CustomerData {
  id: string
  name: string
  nationalId: string
}

interface ContractData {
  id: string
  contractNumber: string
  totalAmount: number
  downPayment: number
  interestRate: number | null
  customerId: string
  customer: { id: string; name: string }
}

export function EditContractForm({ contract }: { contract: ContractData }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [customerId, setCustomerId] = useState(contract.customerId)
  const [totalAmount, setTotalAmount] = useState(String(contract.totalAmount / 100))
  const [downPayment, setDownPayment] = useState(String(contract.downPayment / 100))
  const [interestRate, setInterestRate] = useState(contract.interestRate ? String(contract.interestRate) : "")

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const result = await updateContract(contract.id, form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/dashboard/contracts/${contract.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl" dir="rtl">
      <PageHeader title={`تعديل العقد ${contract.contractNumber}`} description="تحديث بيانات العقد" />

      <form onSubmit={handleSubmit} className="glass-card !p-4 sm:!p-6 space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <Label required>العميل</Label>
          <Select name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.nationalId}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>المبلغ الإجمالي</Label>
            <Input name="totalAmount" type="number" step="0.01" min="0" required
              value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
          </div>
          <div>
            <Label>الدفعة المقدمة</Label>
            <Input name="downPayment" type="number" step="0.01" min="0"
              value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>نسبة الفائدة (%)</Label>
          <Input name="interestRate" type="number" step="0.01" min="0" placeholder="مثال: 10"
            value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}
