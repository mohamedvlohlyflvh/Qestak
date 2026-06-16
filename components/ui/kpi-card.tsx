export function KpiCard({
  label,
  value,
  danger,
}: {
  label: string
  value: string
  danger?: boolean
}) {
  return (
    <div className="kpi-glass !p-4 sm:!p-6">
      <p className="kpi-label">{label}</p>
      <p className={`kpi-value ${danger ? "!text-destructive" : ""}`}>
        {value}
      </p>
    </div>
  )
}

export function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="kpi-glass !p-3 sm:!p-4">
      <p className="kpi-label">{label}</p>
      <p className={`text-2xl font-bold ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  )
}
