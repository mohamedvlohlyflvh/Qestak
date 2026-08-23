import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react"

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="m3-card-outlined !p-0 overflow-hidden">
      {children}
    </div>
  )
}

export function TableWrapper({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function TableInner({ children }: { children: ReactNode }) {
  return <table className="w-full text-sm" dir="rtl">{children}</table>
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-surface-container-low">{children}</tr>
    </thead>
  )
}

export function Th({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-right p-3 font-medium text-sm text-on-surface-variant border-l border-border last:border-l-0 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function Td({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-3 border-l border-border last:border-l-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TRow({ children, className = "", noHover }: { children?: ReactNode; className?: string; noHover?: boolean }) {
  return (
    <tr
      className={`border-b border-border last:border-b-0${
        noHover ? "" : " transition-colors hover:bg-surface-container-low"
      } ${className}`}
    >
      {children}
    </tr>
  )
}
