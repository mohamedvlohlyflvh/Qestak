interface CreditScoreInput {
  totalContracts: number
  completedContracts: number
  totalInstallments: number
  paidOnTime: number
  latePayments: number
  defaultedInstallments: number
  averagePaymentDelayDays: number
  monthsSinceFirstContract: number
}

export interface CreditScoreResult {
  score: number
  grade: "A" | "B" | "C" | "D" | "E"
  label: string
  color: string
}

export function calculateCreditScore(input: CreditScoreInput): CreditScoreResult {
  const {
    totalContracts,
    completedContracts,
    totalInstallments,
    paidOnTime,
    latePayments,
    defaultedInstallments,
    averagePaymentDelayDays,
    monthsSinceFirstContract,
  } = input

  if (totalInstallments === 0) {
    return { score: 500, grade: "C", label: "جديد", color: "bg-muted" }
  }

  const onTimeRatio = totalInstallments > 0 ? paidOnTime / totalInstallments : 0
  const defaultRatio = totalInstallments > 0 ? defaultedInstallments / totalInstallments : 0
  const completionRatio = totalContracts > 0 ? completedContracts / totalContracts : 0

  const base = 300
  const onTimeScore = onTimeRatio * 300
  const latePenalty = Math.min(latePayments * 15, 150)
  const defaultPenalty = defaultRatio * 200
  const delayPenalty = Math.min(averagePaymentDelayDays * 2, 100)
  const tenureBonus = Math.min(monthsSinceFirstContract * 10, 100)
  const completionBonus = completionRatio * 100

  const totalScore = Math.max(0, Math.min(850, Math.round(base + onTimeScore - latePenalty - defaultPenalty - delayPenalty + tenureBonus + completionBonus)))

  if (totalScore >= 750) return { score: totalScore, grade: "A", label: "ممتاز", color: "bg-emerald-500" }
  if (totalScore >= 650) return { score: totalScore, grade: "B", label: "جيد جداً", color: "bg-blue-500" }
  if (totalScore >= 500) return { score: totalScore, grade: "C", label: "جيد", color: "bg-amber-500" }
  if (totalScore >= 350) return { score: totalScore, grade: "D", label: "ضعيف", color: "bg-orange-500" }
  return { score: totalScore, grade: "E", label: "سيء جداً", color: "bg-red-500" }
}

export function getCreditGradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    B: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    C: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    D: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    E: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  }
  return map[grade] || map.C
}
