"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createContract } from "@/app/actions/contracts"
import { PageHeader } from "@/components/ui/page-header"
import { Label, Input, Select, ErrorBanner, Button } from "@/components/ui/card"

interface Customer {
  id: string
  name: string
  nationalId: string
  phone: string
}

function ContractForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(searchParams.get("customerId") || "")
  const [totalAmount, setTotalAmount] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [installmentCount, setInstallmentCount] = useState("6")
  const [installmentInterval, setInstallmentInterval] = useState("30")
  const [interestRate, setInterestRate] = useState("")
  const [showGuarantor, setShowGuarantor] = useState(false)

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {})
  }, [])

  const remaining = Math.max(0, (parseFloat(totalAmount) || 0) - (parseFloat(downPayment) || 0))
  const rate = parseFloat(interestRate) || 0
  const withInterest = rate > 0 ? remaining * (1 + rate / 100) : remaining
  const baseInst = installmentCount ? Math.floor((withInterest * 100) / parseInt(installmentCount)) / 100 : 0
  const totalInst = baseInst * (parseInt(installmentCount) || 0)
  const remCents = Math.round((withInterest - totalInst) * 100) / 100

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setWarning("")

    const form = new FormData(e.currentTarget)
    const result = await createContract(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.warning) {
      setWarning(result.warning)
      setLoading(false)
    } else {
      router.push("/dashboard/contracts")
      router.refresh()
    }
  }

  if (warning) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-semibold text-foreground mb-2">تم إنشاء العقد بنجاح</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">⚠️ {warning}</p>
          <Link href="/dashboard/contracts" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium inline-block hover:opacity-90 transition-opacity">
            العودة للعقود
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl" dir="rtl">
      <PageHeader title="عقد جديد" description="إنشاء عقد تقسيط جديد مع جدولة الأقساط" />

      <form onSubmit={handleSubmit} className="glass-card !p-4 sm:!p-6 space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <Label required>العميل</Label>
          <Select
            name="customerId"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            required
          >
            <option value="">اختر عميل...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.nationalId}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>المبلغ الإجمالي</Label>
            <Input name="totalAmount" type="number" step="0.01" min="0" required value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)} />
          </div>
          <div>
            <Label>الدفعة المقدمة</Label>
            <Input name="downPayment" type="number" step="0.01" min="0" value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>نسبة الفائدة (%)</Label>
          <Input name="interestRate" type="number" step="0.01" min="0" placeholder="مثال: 10" value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>عدد الأقساط</Label>
            <Input name="installmentCount" type="number" min="1" max="60" required value={installmentCount}
              onChange={(e) => setInstallmentCount(e.target.value)} />
          </div>
          <div>
            <Label>المدة (يوم)</Label>
            <Input name="installmentInterval" type="number" min="1" value={installmentInterval}
              onChange={(e) => setInstallmentInterval(e.target.value)} />
          </div>
        </div>

        <div className="glass-card !p-4 !shadow-none space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>المبلغ بعد الدفعة المقدمة</span>
            <span className="font-bold text-foreground">{remaining.toFixed(2)} ج.م</span>
          </div>
          {rate > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>بعد الفائدة ({rate}%)</span>
              <span className="font-bold text-foreground">{withInterest.toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>القسط (تقريباً)</span>
            <span className="font-bold text-foreground">{baseInst.toFixed(2)} ج.م</span>
          </div>
          {remCents > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>القسط الأخير سيشمل الفرق</span>
              <span className="font-bold">+{remCents.toFixed(2)} ج.م</span>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <button type="button" onClick={() => setShowGuarantor(!showGuarantor)}
            className="text-sm text-primary hover:underline">
            {showGuarantor ? "إخفاء بيانات الضامن" : "+ إضافة ضامن"}
          </button>

          {showGuarantor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <Label>اسم الضامن</Label>
                <Input name="guarantorName" type="text" />
              </div>
              <div>
                <Label>رقم الهوية</Label>
                <Input name="guarantorNationalId" type="text" />
              </div>
              <div>
                <Label>الهاتف</Label>
                <Input name="guarantorPhone" type="tel" />
              </div>
              <div>
                <Label>العنوان</Label>
                <Input name="guarantorAddress" type="text" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "جاري الإنشاء..." : "إنشاء العقد"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">جاري التحميل...</div>}>
      <ContractForm />
    </Suspense>
  )
}
