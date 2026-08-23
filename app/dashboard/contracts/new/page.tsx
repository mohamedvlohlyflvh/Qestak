"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { createContractWithSchedule, buildInstallmentSchedule, addGuarantorLocal } from "@/app/lib/dexie-service"
import { getCustomersLocal } from "@/app/lib/dexie-service"
import { DexieCustomer } from "@/app/lib/dexie-db"
import { PageHeader } from "@/components/ui/page-header"
import { Label, Input, Select, ErrorBanner, Button } from "@/components/ui/card"

function ContractForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<DexieCustomer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(searchParams.get("customerId") || "")
  const [totalAmount, setTotalAmount] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [installmentCount, setInstallmentCount] = useState("6")
  const [installmentInterval, setInstallmentInterval] = useState("30")
  const [totalPeriodValue, setTotalPeriodValue] = useState("")
  const [totalPeriodUnit, setTotalPeriodUnit] = useState("month")
  const [interestRate, setInterestRate] = useState("")
  const [showGuarantor, setShowGuarantor] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      getCustomersLocal(session.user.id).then(setCustomers).catch(() => {})
    }
  }, [session?.user?.id])

  const remaining = Math.max(0, (parseFloat(totalAmount) || 0) - (parseFloat(downPayment) || 0))
  const rate = parseFloat(interestRate) || 0
  const withInterest = rate > 0 ? remaining * (1 + rate / 100) : remaining
  const baseInst = installmentCount ? Math.floor((withInterest * 100) / parseInt(installmentCount)) / 100 : 0
  const totalInst = baseInst * (parseInt(installmentCount) || 0)
  const remCents = Math.round((withInterest - totalInst) * 100) / 100

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session?.user?.id) { setError("يجب تسجيل الدخول"); return }
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const formCustomerId = form.get("customerId") as string
    const formTotalAmount = parseFloat(form.get("totalAmount") as string) || 0
    const formDownPayment = parseFloat(form.get("downPayment") as string) || 0
    const formInterestRate = parseFloat(form.get("interestRate") as string) || 0
    const formInstallmentInterval = parseInt(form.get("installmentInterval") as string) || 30
    const formDescription = (form.get("description") as string) || undefined
    const formTotalPeriodValue = parseFloat(form.get("totalPeriodValue") as string) || undefined

    // Find customer
    const selectedCustomer = customers.find(c => c.serverId === formCustomerId || String(c.id) === formCustomerId)
    const remainingAmount = formTotalAmount - formDownPayment

    // Generate contract number
    const now = new Date()
    const contractNumber = `QST-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`

    const count = parseInt(installmentCount) || 0
    const interval = formInstallmentInterval

    const result = await createContractWithSchedule({
      contractNumber,
      totalAmount: formTotalAmount,
      downPayment: formDownPayment,
      remainingAmount,
      interestRate: formInterestRate > 0 ? formInterestRate : undefined,
      installmentInterval: interval,
      totalPeriodValue: formTotalPeriodValue,
      totalPeriodUnit,
      description: formDescription,
      status: "ACTIVE",
      customerId: selectedCustomer?.id,
      customerServerId: selectedCustomer?.serverId,
      customerName: selectedCustomer?.name || '',
    }, session.user.id, count > 0 ? buildInstallmentSchedule({
      totalAmount: remainingAmount,
      interestRate: formInterestRate > 0 ? formInterestRate : undefined,
      installmentCount: count,
      installmentInterval: interval,
      startDate: new Date(),
    }) : [])

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Save guarantor if provided
      const guarantorName = (form.get("guarantorName") as string)?.trim()
      if (guarantorName && result.localId) {
        await addGuarantorLocal({
          name: guarantorName,
          nationalId: (form.get("guarantorNationalId") as string)?.trim() || "",
          phone: (form.get("guarantorPhone") as string)?.trim() || "",
          address: (form.get("guarantorAddress") as string)?.trim() || undefined,
          contractId: result.localId,
        })
      }
      router.push("/dashboard/contracts")
    }
  }

  return (
    <div className="max-w-2xl" dir="rtl">
      <PageHeader title="عقد جديد" description="إنشاء عقد تقسيط جديد مع جدولة الأقساط" />

      <form onSubmit={handleSubmit} className="glass-card !p-3 sm:!p-6 space-y-4 sm:space-y-5">
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
              <option key={c.id} value={c.serverId || String(c.id)}>{c.name} — {c.nationalId}</option>
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
            <Label required>المدة بين كل قسط (يوم)</Label>
            <Input name="installmentInterval" type="number" min="1" required value={installmentInterval}
              onChange={(e) => setInstallmentInterval(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>وصف العقد</Label>
          <textarea
            name="description"
            rows={3}
            placeholder="معلومات إضافية عن العقد"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all resize-y"
          />
        </div>

        <div>
          <Label>مدة السداد بالكامل</Label>
          <div className="flex gap-2">
            <Input name="totalPeriodValue" type="number" step="0.5" min="0" placeholder="مثال: 1.5" value={totalPeriodValue}
              onChange={(e) => setTotalPeriodValue(e.target.value)} className="flex-1" />
            <select name="totalPeriodUnit" value={totalPeriodUnit}
              onChange={(e) => setTotalPeriodUnit(e.target.value)}
              className="w-28 px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="day">يوم</option>
              <option value="month">شهر</option>
              <option value="year">سنة</option>
            </select>
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

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden transition-all duration-300 ease-out ${showGuarantor ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none mt-0"}`}>
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
