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
    <div className="py-16 text-center text-muted-foreground">
      <p className="text-lg mb-2">{title}</p>
      <p className="text-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
