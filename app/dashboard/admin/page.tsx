"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { setContractLimit } from "@/app/actions/admin"

interface UserResult {
  id: string
  merchantId: string | null
  name: string | null
  email: string
  contractLimit: number | null
  plan: string
  _count: { contracts: number }
}

export default function AdminPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session?.user?.isAdmin) router.push("/dashboard")
  }, [status, session, router])

  if (status === "loading" || !session?.user?.isAdmin) return null

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setIsSearching(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`)
      if (!res.ok) {
        if (res.status === 403) { setError("ليس لديك صلاحية الوصول إلى لوحة التحكم"); setIsSearching(false); return }
        throw new Error("Search failed")
      }
      const data = await res.json()
      setResults(data)
    } catch {
      setError("حدث خطأ أثناء البحث")
    }
    setIsSearching(false)
  }, [])

  function handleInput(v: string) {
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 300)
  }

  async function handleSetLimit(userId: string, value: string) {
    const limit = value === "" ? null : parseInt(value, 10)
    if (limit !== null && (isNaN(limit) || limit < 0)) return
    await setContractLimit(userId, limit)
    doSearch(query)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة التاجر وحدود العقود</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="ابحث برقم التاجر أو الاسم أو البريد..."
          className="w-full pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {isSearching && <p className="text-muted-foreground text-sm">جاري البحث...</p>}

      <div className="space-y-3">
        {results.map((user) => (
          <div key={user.id} className="glass-card !rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{user.name || "بدون اسم"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">{user.merchantId || "—"}</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                العقود: <strong className="text-foreground">{user._count.contracts}</strong>
                {user.contractLimit !== null && <span className="text-muted-foreground"> / {user.contractLimit}</span>}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.plan}</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground whitespace-nowrap">حد العقود:</label>
              <input
                type="number"
                min="0"
                defaultValue={user.contractLimit ?? ""}
                placeholder="بدون حد"
                className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                onBlur={(e) => handleSetLimit(user.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetLimit(user.id, (e.target as HTMLInputElement).value)
                }}
              />
              <button
                onClick={() => handleSetLimit(user.id, "")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                إزالة الحد
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isSearching && query.length >= 2 && results.length === 0 && !error && (
        <p className="text-muted-foreground text-sm text-center py-8">لا توجد نتائج</p>
      )}

      {query.length < 2 && results.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">اكتب على الأقل حرفين للبحث</p>
      )}
    </div>
  )
}
