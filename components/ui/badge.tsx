function gradeFromScore(score: number) {
  if (score >= 80) return { grade: "A", label: "ممتاز", color: "emerald" }
  if (score >= 60) return { grade: "B", label: "جيد جداً", color: "blue" }
  if (score >= 40) return { grade: "C", label: "جيد", color: "amber" }
  if (score >= 20) return { grade: "D", label: "ضعيف", color: "orange" }
  return { grade: "E", label: "سيء جداً", color: "red" }
}

const contractStyles: Record<string, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  DEFAULTED: "bg-destructive/10 text-destructive",
}
const contractLabels: Record<string, string> = { ACTIVE: "نشط", COMPLETED: "مكتمل", DEFAULTED: "متخلف" }

export function ContractBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${contractStyles[status] || ""}`}>
      {contractLabels[status] || status}
    </span>
  )
}

const installmentStyles: Record<string, string> = {
  UPCOMING: "bg-[var(--color-outline-variant)]/30 text-muted-foreground",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  OVERDUE: "bg-destructive/10 text-destructive",
  PARTIAL: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}
const installmentLabels: Record<string, string> = { UPCOMING: "قادم", PAID: "مدفوع", OVERDUE: "متأخر", PARTIAL: "جزئي" }

export function InstallmentBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${installmentStyles[status] || ""}`}>
      {installmentLabels[status] || status}
    </span>
  )
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  red: "bg-destructive/10 text-destructive border-destructive/20",
}

export function CreditBadge({ score }: { score: number }) {
  const g = gradeFromScore(score)
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[g.color] || ""}`}>
      <span className="font-bold">{g.grade}</span>
      <span className="opacity-60">{score}</span>
    </span>
  )
}
