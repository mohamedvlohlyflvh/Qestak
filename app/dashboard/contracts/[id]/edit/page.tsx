"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getCustomersLocal, getContractsLocal, updateContractLocal } from "@/app/lib/dexie-service"
import { DexieCustomer } from "@/app/lib/dexie-db"
import { PageHeader } from "@/components/ui/page-header"
import { Label, Input, Select, ErrorBanner, Button } from "@/components/ui/card"

export default function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [customers, setCustomers] = useState<DexieCustomer[]>([])
  const [localId, setLocalId] = useState<number | null>(null)
  const [contractNumber, setContractNumber] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [interestRate, setInterestRate] = useState("")

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    async function load() {
      try {
        const [allContracts, allCustomers] = await Promise.all([
          getContractsLocal(uid),
          getCustomersLocal(uid)
        ])
        
        setCustomers(allCustomers)
        
        const found = allContracts.find(c => c.serverId === id || String(c.id) === id)
        if (found) {
          if (found.id) setLocalId(found.id)
          setContractNumber(found.contractNumber)
          setCustomerId(found.customerServerId || String(found.customerId || ''))
          setTotalAmount(String(found.totalAmount))
          setDownPayment(String(found.downPayment))
          setInterestRate(found.interestRate ? String(found.interestRate) : "")
        } else {
          setError("لم يتم العثور على العقد في التخزين المحلي")
        }
      } catch {
        setError("فشل تحميل بيانات العقد")
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [id, session?.user?.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!localId) { setError("لم يتم العثور على العقد"); return }
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const rate = parseFloat(form.get("interestRate") as string) || 0
    const totalAmount = parseFloat(form.get("totalAmount") as string) || 0
    const downPayment = parseFloat(form.get("downPayment") as string) || 0
    const customerServerId = form.get("customerId") as string
    const selectedCustomer = customers.find(c => c.serverId === customerServerId || String(c.id) === customerServerId)

    const result = await updateContractLocal(localId, {
      totalAmount,
      downPayment,
      remainingAmount: Math.max(0, totalAmount - downPayment),
      interestRate: rate > 0 ? rate : undefined,
      customerServerId,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || '',
      updatedAt: new Date(),
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/dashboard/contracts/${id}`)
    }
  }

  if (fetching) return <div className="p-6 text-muted-foreground">جاري التحميل...</div>

  return (
    <div className="max-w-2xl" dir="rtl">
      <PageHeader title={`تعديل العقد ${contractNumber}`} description="تحديث بيانات العقد" />

      <form onSubmit={handleSubmit} className="glass-card !p-4 sm:!p-6 space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <Label required>العميل</Label>
          <Select name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            {customers.map((c) => (
              <option key={c.id} value={c.serverId || String(c.id)}>{c.name} — {c.nationalId}</option>
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
