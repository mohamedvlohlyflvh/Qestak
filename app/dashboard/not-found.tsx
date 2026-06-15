import Link from "next/link"

export default function DashboardNotFound() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <span className="text-4xl mb-4">🔍</span>
      <h2 className="text-lg font-semibold text-foreground mb-1">الصفحة غير موجودة</h2>
      <p className="text-sm text-muted-foreground mb-4">لم نتمكن من العثور على الصفحة المطلوبة.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-sm rounded-lg transition-opacity"
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}
