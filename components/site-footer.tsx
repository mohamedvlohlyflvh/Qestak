import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4">
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <Link href="/" className="text-xl font-bold"><span className="text-gradient-gold">قسطك</span></Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/pricing" className="hover:text-foreground transition-colors">الأسعار</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">شروط الاستخدام</Link>
        </div>
      </div>
        <p>© {new Date().getFullYear()} <span className="text-gradient-gold">قسطك</span> — جميع الحقوق محفوظة</p>
        <p className="mt-1">منصة تقسيط ذكية لإدارة الأقساط والمدفوعات والعملاء</p>
        <p className="mt-3">رقم الدعم: <span dir="ltr" className="font-mono">01206363468</span></p>
      </div>
    </footer>
  )
}
