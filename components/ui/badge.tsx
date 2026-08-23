const contractStyles: Record<string, string> = {
  ACTIVE: "bg-primary-container text-on-primary-container",
  COMPLETED: "bg-tertiary-container text-on-tertiary-container",
  DEFAULTED: "bg-error-container text-on-error-container",
}
const contractLabels: Record<string, string> = { ACTIVE: "نشط", COMPLETED: "مكتمل", DEFAULTED: "متخلف" }

export function ContractBadge({ status }: { status: string }) {
  return (
    <span className={`m3-badge ${contractStyles[status] || ""}`}>
      {contractLabels[status] || status}
    </span>
  )
}

const installmentStyles: Record<string, string> = {
  UPCOMING: "bg-surface-container-highest text-on-surface-variant",
  PAID: "bg-tertiary-container text-on-tertiary-container",
  OVERDUE: "bg-error-container text-on-error-container",
  PARTIAL: "bg-secondary-container text-on-secondary-container",
}
const installmentLabels: Record<string, string> = { UPCOMING: "قادم", PAID: "مدفوع", OVERDUE: "متأخر", PARTIAL: "جزئي" }

export function InstallmentBadge({ status }: { status: string }) {
  return (
    <span className={`m3-badge ${installmentStyles[status] || ""}`}>
      {installmentLabels[status] || status}
    </span>
  )
}

