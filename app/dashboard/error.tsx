"use client"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <span className="text-4xl mb-4">⚠️</span>
      <h2 className="text-lg font-semibold text-foreground mb-1">حدث خطأ</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {error.message || "تعذر تحميل الصفحة. حاول مرة أخرى."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-sm rounded-lg transition-opacity"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
