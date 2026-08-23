"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { setContractLimit, setUserPlan } from "@/app/actions/admin"

interface UserResult {
  id: string
  merchantId: string | null
  name: string | null
  email: string
  contractLimit: number | null
  plan: string
  _count: { contracts: number }
}

const PLAN_NAMES: Record<string, string> = {
  FREE: "مجاني",
  BASIC: "أساسي",
  PRO: "احترافي",
  UNLIMITED: "غير محدود",
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  BASIC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PRO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  UNLIMITED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

export default function AdminPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session?.user?.isAdmin) router.push("/dashboard")
  }, [status, session, router])

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

  if (status === "loading" || !session?.user?.isAdmin) return null

  function handleInput(v: string) {
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 300)
  }

  async function handleSetLimit(userId: string, value: string) {
    const limit = value === "" ? null : parseInt(value, 10)
    if (limit !== null && (isNaN(limit) || limit < 0)) return
    setLoadingUserId(userId)
    await setContractLimit(userId, limit)
    setLoadingUserId(null)
    doSearch(query)
  }

  async function handleSetPlan(userId: string, plan: string) {
    setLoadingUserId(userId)
    await setUserPlan(userId, plan)
    setLoadingUserId(null)
    doSearch(query)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة التجار — الخطط وحدود العقود</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {results.map((user) => {
          const isLoading = loadingUserId === user.id
          return (
            <div key={`${user.id}-${user.plan}-${user.contractLimit}`} className={`glass-card !rounded-xl p-4 space-y-4 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user.name || "بدون اسم"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-sm font-mono text-muted-foreground" dir="ltr">{user.merchantId || "—"}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  العقود: <strong className="text-foreground">{user._count.contracts}</strong>
                  {user.contractLimit !== null && (
                    <span className="text-muted-foreground"> / {user.contractLimit}</span>
                  )}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PLAN_COLORS[user.plan] || "bg-muted text-muted-foreground"}`}>
                  {PLAN_NAMES[user.plan] || user.plan}
                </span>
              </div>

              {/* Plan Selector */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">تغيير الخطة:</label>
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(PLAN_NAMES).map(([planId, planName]) => (
                    <button
                      key={planId}
                      onClick={() => handleSetPlan(user.id, planId)}
                      disabled={isLoading}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        user.plan === planId
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {planName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contract Limit */}
              <div className="border-t border-border/50 pt-3">
                <label className="text-xs text-muted-foreground block mb-1.5">حد العقود (أدخل رقمًا أو اتركه فارغًا لإلغاء الحد):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    defaultValue={user.contractLimit ?? ""}
                    placeholder="بدون حد"
                    className="flex-1 max-w-[160px] px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    onBlur={(e) => handleSetLimit(user.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSetLimit(user.id, (e.target as HTMLInputElement).value)
                    }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSetLimit(user.id, "")}
                    disabled={isLoading}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    إزالة الحد
                  </button>
                </div>
              </div>
            </div>
          )
        })}
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
