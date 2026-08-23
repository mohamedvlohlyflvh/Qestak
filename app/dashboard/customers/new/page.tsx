"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { addCustomerLocal } from "@/app/lib/dexie-service"
import { PageHeader } from "@/components/ui/page-header"
import { Label, Input, ErrorBanner, Button } from "@/components/ui/card"

export default function NewCustomerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session?.user?.id) { setError("يجب تسجيل الدخول"); return }
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const merchantId = session.user.id

    const result = await addCustomerLocal({
      name: form.get("name") as string,
      nationalId: form.get("nationalId") as string,
      phone: form.get("phone") as string,
      address: form.get("address") as string,
      jobTitle: (form.get("jobTitle") as string) || undefined,
      creditScore: 100,
    }, merchantId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/dashboard/customers")
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
