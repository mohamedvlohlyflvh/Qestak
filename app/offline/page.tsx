import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold mb-2">أنت غير متصل بالإنترنت</h1>
        <p className="text-muted-foreground mb-6">
          لا تقلق! يمكنك الاستمرار في استخدام التطبيق. 
          البيانات التي قمت بحفظها سابقاً متوفرة حالياً.
          سيتم مزامنة أي تغييرات تقوم بها تلقائياً عند عودة الاتصال.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            العودة إلى لوحة التحكم
          </Link>
          <Link
            href="/dashboard/customers"
            className="block w-full px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium"
          >
            عرض العملاء
          </Link>
          <Link
            href="/dashboard/contracts"
            className="block w-full px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium"
          >
            عرض العقود
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          قسطك — تطبيق يعمل بدون إنترنت
        </p>
      </div>
    </div>
  )
}
