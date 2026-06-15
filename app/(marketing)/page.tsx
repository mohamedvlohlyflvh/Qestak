import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LandingAnimations } from "@/components/landing-animations"
import { auth } from "@/auth"

const features = [
  { icon: "🤖", title: "تحصيل ذكي", desc: "خوارزميات لتحديد أولويات التحصيل بناءً على سلوك الدفع" },
  { icon: "📊", title: "لوحة تحكم مالية", desc: "مؤشرات أداء آنية وإحصائيات دقيقة عن المحفظة الائتمانية" },
  { icon: "👥", title: "إدارة العملاء", desc: "سجل كامل مع درجات ائتمانية وتصنيف ذكي للمخاطر" },
  { icon: "📄", title: "إدارة العقود", desc: "تقسيم آلي للأقساط وجدولة مع مراقبة يومية" },
  { icon: "🔔", title: "إشعارات ذكية", desc: "تذكير تلقائي للعملاء قبل استحقاق الأقساط" },
  { icon: "🔍", title: "بحث سريع", desc: "ابحث عن أي عميل أو عقد بسرعة — بالاسم أو الرقم" },
]

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <LandingAnimations>
    <div dir="rtl">
      <header className="glass-header px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <span className="text-xl font-bold">
          <span className="text-gradient-gold">قسطك</span>
        </span>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold text-sm !py-2 !px-5">الانتقال إلى لوحة التحكم</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">تسجيل الدخول</Link>
              <Link href="/register" className="btn-gold text-sm !py-2 !px-5">ابدأ مجاناً</Link>
            </>
          )}
          <ThemeToggle iconOnly />
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 glass-card !bg-[rgba(255,215,0,0.1)] !border-primary/30 !backdrop-blur-xl px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary glow-gold inline-block" />
          <span className="text-xs font-semibold text-primary">منصة تقسيط ذكية — بخوارزميات متطورة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6">
          إدارة التقسيط
          <br />
          <span className="text-gradient-gold">بذكاء واحترافية</span>
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
          قسطك بتساعد التجار يديروا نظام التقسيط بتاعهم بذكاء — من تتبع الأقساط والتحصيل
          لتحليل المخاطر والتواصل التلقائي مع العملاء.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold text-sm sm:text-base !py-3 sm:!py-4 !px-6 sm:!px-10">الانتقال إلى لوحة التحكم</Link>
          ) : (
            <>
              <Link href="/register" className="btn-gold text-sm sm:text-base !py-3 sm:!py-4 !px-6 sm:!px-10">ابدأ مجاناً</Link>
              <Link href="/login" className="btn-glass text-sm sm:text-base !py-3 sm:!py-4 !px-6 sm:!px-10">تسجيل الدخول</Link>
            </>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
        <h2 className="text-3xl font-bold text-center mb-4">كل اللي تحتاجه لإدارة التقسيط</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          أدوات متكاملة لمساعدتك على إدارة أعمال التقسيط بكفاءة واحترافية
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card-interactive p-4 sm:p-6">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-base font-bold mt-4 mb-1.5 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    </LandingAnimations>
  )
}
