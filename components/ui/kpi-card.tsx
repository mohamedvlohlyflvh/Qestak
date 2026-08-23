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
    <div className="kpi-glass">
      <p className="kpi-label">{label}</p>
      <p className={`kpi-value ${danger ? "!text-error" : ""}`}>
        {value}
      </p>
    </div>
  )
}

