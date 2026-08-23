export const PLANS = {
  FREE: { id: "FREE", name: "مجاني", price: 0, contractsPerWeek: 0, trialDays: 3 },
  BASIC: { id: "BASIC", name: "أساسي", price: 199, contractsPerWeek: 30 },
  PRO: { id: "PRO", name: "احترافي", price: 399, contractsPerWeek: 100 },
  UNLIMITED: { id: "UNLIMITED", name: "غير محدود", price: 499, contractsPerWeek: Infinity },
} as const

export const FREE_CONTRACT_LIMIT = 5

export type PlanId = keyof typeof PLANS

export function formatPrice(cents: number): string {
  return `${(cents / 100).toLocaleString("ar-EG")} ج.م`
}
