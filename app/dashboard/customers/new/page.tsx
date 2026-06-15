"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCustomer } from "@/app/actions/customers"
import { PageHeader } from "@/components/ui/page-header"
import { Card, Label, Input, ErrorBanner, Button } from "@/components/ui/card"

export default function NewCustomerPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const result = await createCustomer(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/dashboard/customers")
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg" dir="rtl">
      <PageHeader title="إضافة عميل جديد" description="بيانات العميل الأساسية (KYC)" />

      <form onSubmit={handleSubmit} className="glass-card !p-4 sm:!p-6 space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <Label required>الاسم الكامل</Label>
          <Input name="name" required />
        </div>
        <div>
          <Label required>رقم الهوية الوطنية</Label>
          <Input name="nationalId" required dir="ltr" />
        </div>
        <div>
          <Label required>رقم الهاتف</Label>
          <Input name="phone" required dir="ltr" />
        </div>
        <div>
          <Label required>العنوان</Label>
          <Input name="address" required />
        </div>
        <div>
          <Label>المسمى الوظيفي</Label>
          <Input name="jobTitle" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "جاري الحفظ..." : "حفظ العميل"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}
