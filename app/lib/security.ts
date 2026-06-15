const MAX_CACHE = 1000

const hits = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of hits) {
    if (val.resetAt < now || hits.size > MAX_CACHE * 2) hits.delete(key)
  }
}, 60_000)

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  let entry = hits.get(key)

  if (!entry || entry.resetAt < now) {
    if (hits.size >= MAX_CACHE) {
      const oldest = hits.entries().next().value
      if (oldest) hits.delete(oldest[0])
    }
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  entry.count++
  const remaining = maxRequests - entry.count
  if (remaining < 0) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  return { allowed: true, remaining, resetIn: entry.resetAt - now }
}

/**
 * CSRF: تحقق من صحة Origin/Referer
 */
const ALLOWED_ORIGINS = [
  process.env.AUTH_URL || "http://localhost:3000",
  "http://localhost:3000",
]

export function checkCSRF(req: Request): { ok: boolean; reason?: string } {
  const raw = req.headers.get("origin") || req.headers.get("referer") || ""
  if (!raw) return { ok: false, reason: "مصدر الطلب غير معروف" }

  let origin: string
  try { origin = new URL(raw).origin } catch { return { ok: false, reason: "مصدر غير صالح" } }

  const allowed = ALLOWED_ORIGINS.some((o) => {
    try { return new URL(o).origin === origin } catch { return false }
  })
  if (!allowed) return { ok: false, reason: "مصدر غير مصرح" }

  return { ok: true }
}
