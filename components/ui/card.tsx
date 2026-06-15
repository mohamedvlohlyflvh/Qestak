import { ReactNode } from "react"

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card p-4 sm:p-5 ${className}`}>{children}</div>
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}

export function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children} {required && "*"}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all ${props.className || ""}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all ${props.className || ""}`}
    />
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3">{message}</div>
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  if (variant === "secondary") {
    return <button {...props} className={`btn-glass !py-2 !px-4 disabled:opacity-50 ${className}`}>{children}</button>
  }
  return <button {...props} className={`btn-gold !py-2 !px-4 disabled:opacity-50 ${className}`}>{children}</button>
}

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={`btn-gold !py-2 !px-4 inline-block text-center ${className}`}>
      {children}
    </a>
  )
}

export function OverdueBanner({ count }: { count: number }) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 text-destructive text-sm">
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        {count} قسط متأخر — يرجى متابعة التحصيل
      </span>
    </div>
  )
}
