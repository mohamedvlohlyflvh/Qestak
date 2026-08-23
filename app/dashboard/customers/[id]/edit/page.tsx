"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getCustomersLocal, updateCustomerLocal } from "@/app/lib/dexie-service"
import { PageHeader } from "@/components/ui/page-header"
import { Label, Input, ErrorBanner, Button } from "@/components/ui/card"

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [fetching, setFetching] = useState(true)
  const [localId, setLocalId] = useState<number | null>(null)

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    async function load() {
      try {
        const all = await getCustomersLocal(uid)
        const found = all.find(c => c.serverId === id || String(c.id) === id)
        if (found) {
          setName(found.name)
          setPhone(found.phone)
          setAddress(found.address)
          setJobTitle(found.jobTitle || "")
          if (found.id) setLocalId(found.id)
        } else {
          setError("لم يتم العثور على العميل في التخزين المحلي")
        }
      } catch {
        setError("فشل تحميل بيانات العميل")
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [id, session?.user?.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!localId) { setError("لم يتم العثور على العميل"); return }
    setLoading(true)
    setError("")

    const result = await updateCustomerLocal(localId, {
      name,
      phone,
      address,
      jobTitle: jobTitle || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/dashboard/customers/${id}`)
    }
  }

  if (fetching) return <div className="p-6 text-muted-foreground">جاري التحميل...</div>

  return (
    <div className="max-w-lg" dir="rtl">
      <PageHeader title="تعديل العميل" description="تحديث بيانات العميل" />

      <form onSubmit={handleSubmit} className="glass-card !p-4 sm:!p-6 space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <Label required>الاسم الكامل</Label>
          <Input name="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label required>رقم الهاتف</Label>
          <Input name="phone" required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label required>العنوان</Label>
          <Input name="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label>المسمى الوظيفي</Label>
          <Input name="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
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
