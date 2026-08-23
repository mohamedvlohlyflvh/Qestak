import { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <div className="min-w-0 flex flex-col gap-2">
        <h1 className="text-headline-sm sm:text-headline-md font-bold text-on-surface">{title}</h1>
        <p className="text-body-md text-on-surface-variant mb-2" style={{ wordSpacing: '0.25em' }}>{description}</p>
      </div>
      {actions && <div className="flex gap-2 items-center shrink-0">{actions}</div>}
    </div>
  )
}
