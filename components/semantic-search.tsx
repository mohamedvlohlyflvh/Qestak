"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { db } from "@/app/lib/dexie-db"

interface SearchResult {
  type: "customer" | "contract"
  id: number
  label: string
  sublabel: string
}

export function SemanticSearch() {
  const router = useRouter()
  const { data: session } = useSession()
  const merchantId = session?.user?.id
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setIsOpen(false); return }
    if (!merchantId) { setResults([]); setIsOpen(false); return }
    setIsSearching(true)
    try {
      const lower = q.trim().toLowerCase()
      const matched: SearchResult[] = []

      // Search customers locally via Dexie
      const customers = await db.customers
        .filter((c) =>
          c.merchantId === merchantId &&
          (c.name.toLowerCase().includes(lower) ||
          c.nationalId.toLowerCase().includes(lower) ||
          c.phone.toLowerCase().includes(lower))
        )
        .limit(5)
        .toArray()

      for (const c of customers) {
        matched.push({
          type: "customer",
          id: c.id!,
          label: c.name,
          sublabel: `${c.nationalId} — ${c.phone}`,
        })
      }

      // Search contracts locally via Dexie
      const contracts = await db.contracts
        .filter((c) =>
          c.merchantId === merchantId &&
          (c.contractNumber.toLowerCase().includes(lower) ||
          (c.customerName ?? "").toLowerCase().includes(lower))
        )
        .limit(5)
        .toArray()

      for (const c of contracts) {
        matched.push({
          type: "contract",
          id: c.id!,
          label: `عقد ${c.contractNumber}`,
          sublabel: c.customerName ?? "",
        })
      }

      setResults(matched.slice(0, 8))
      setIsOpen(matched.length > 0)
    } catch {
      setResults([])
    }
    setIsSearching(false)
  }, [merchantId])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 250)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  function navigate(r: SearchResult) {
    setIsOpen(false)
    setQuery("")
    if (r.type === "customer") router.push(`/dashboard/customers/${r.id}`)
    else router.push(`/dashboard/contracts/${r.id}`)
  }

  return (
    <div className="relative w-full max-w-full sm:max-w-md min-w-0" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="ابحث عن عميل أو عقد..."
          className="w-full pr-10 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        <svg className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && (
        <div className="!absolute top-full mt-1 left-0 right-0 glass-card !rounded-xl z-[60] max-h-80 overflow-y-auto !bg-background/95">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">جاري البحث...</div>
          ) : (
            results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => navigate(r)}
                className="w-full text-right px-4 py-3 hover:bg-muted hover:backdrop-blur-none border-b border-border last:border-0 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    r.type === "customer" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-primary/10 text-primary"
                  }`}>
                    {r.type === "customer" ? "عميل" : "عقد"}
                  </span>
                  <span className="text-sm font-medium text-foreground">{r.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 mr-7">{r.sublabel}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
