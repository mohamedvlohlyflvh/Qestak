import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs mb-1">
          <Link href="/" className="text-sm font-bold"><span className="text-gradient-gold">قسطك</span></Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">الأسعار</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">شروط الاستخدام</Link>
        </div>
        <p>© {new Date().getFullYear()} <span className="text-gradient-gold">قسطك</span> — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
