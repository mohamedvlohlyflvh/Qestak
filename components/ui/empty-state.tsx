import { ReactNode } from "react"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="py-16 text-center text-on-surface-variant">
      <p className="text-title-md mb-2">{title}</p>
      <p className="text-body-md mb-6">{description}</p>
      {action}
    </div>
  )
}
