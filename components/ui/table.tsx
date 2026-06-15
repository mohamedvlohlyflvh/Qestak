import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react"

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="glass-card !p-0 overflow-hidden">
      {children}
    </div>
  )
}

export function TableWrapper({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function TableInner({ children }: { children: ReactNode }) {
  return <table className="w-full text-sm">{children}</table>
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-[var(--color-primary)]/5">{children}</tr>
    </thead>
  )
}

export function Th({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-right p-3 font-medium text-muted-foreground border-l border-border last:border-l-0 ${className}`}
      style={{ unicodeBidi: "plaintext" }}
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
      style={{ unicodeBidi: "plaintext" }}
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
        noHover
          ? ""
          : " transition-colors hover:bg-[var(--color-primary)]/3"
      } ${className}`}
    >
      {children}
    </tr>
  )
}
