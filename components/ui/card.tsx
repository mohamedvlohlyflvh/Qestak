import { ReactNode } from "react"

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`m3-card !p-4 sm:!p-5 ${className}`}>{children}</div>
}

export function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="m3-label">
      {children} {required && <span className="text-error">*</span>}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`m3-text-field ${props.className || ""}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`m3-select ${props.className || ""}`}
    />
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-error-container text-on-error-container text-sm rounded-lg p-4">
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span>{message}</span>
    </div>
  )
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outlined" | "text" }) {
  const cls = variant === "primary" ? "m3-btn-filled"
    : variant === "secondary" ? "m3-btn-tonal"
    : variant === "outlined" ? "m3-btn-outlined"
    : "m3-btn-text"
  return (
    <button {...props} className={`${cls} ${className}`}>
      {children}
    </button>
  )
}
