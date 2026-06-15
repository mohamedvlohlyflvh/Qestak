interface CollectionScoreInput {
  daysOverdue: number
  totalInstallments: number
  paidInstallments: number
  totalAmountCents: number
  paidAmountCents: number
  missedCount: number
  daysSinceLastPayment: number | null
}

export interface CollectionScoreResult {
  score: number
  priority: "critical" | "high" | "medium" | "low" | "safe"
  label: string
}

export function calculateCollectionScore(input: CollectionScoreInput): CollectionScoreResult {
  const {
    daysOverdue,
    totalInstallments,
    paidInstallments,
    totalAmountCents,
    paidAmountCents,
    missedCount,
    daysSinceLastPayment,
  } = input

  const paymentRatio = totalInstallments > 0 ? paidInstallments / totalInstallments : 0
  const amountRatio = totalAmountCents > 0 ? paidAmountCents / totalAmountCents : 0

  const overdueScore = Math.min(daysOverdue / 90, 1) * 35
  const paymentScore = (1 - paymentRatio) * 25
  const missedScore = Math.min(missedCount / totalInstallments, 1) * 20
  const recencyScore = daysSinceLastPayment !== null ? Math.min(daysSinceLastPayment / 60, 1) * 10 : 5
  const valueScore = amountRatio < 0.3 ? 10 : amountRatio < 0.6 ? 5 : 0

  const totalScore = Math.round(overdueScore + paymentScore + missedScore + recencyScore + valueScore)

  if (daysOverdue === 0 && missedCount === 0) {
    return { score: 0, priority: "safe", label: "آمن" }
  }

  if (totalScore >= 70) return { score: totalScore, priority: "critical", label: "حرج" }
  if (totalScore >= 45) return { score: totalScore, priority: "high", label: "عالي" }
  if (totalScore >= 25) return { score: totalScore, priority: "medium", label: "متوسط" }
  return { score: totalScore, priority: "low", label: "منخفض" }
}

export function getCollectionColor(priority: string): string {
  switch (priority) {
    case "critical": return "bg-red-500"
    case "high": return "bg-orange-500"
    case "medium": return "bg-amber-500"
    case "low": return "bg-blue-500"
    case "safe": return "bg-emerald-500"
    default: return "bg-muted-foreground"
  }
}
