import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "شروط الاستخدام",
}

export default function TermsPage() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← العودة للرئيسية</Link>
      <h1 className="text-3xl font-bold mb-2">شروط الاستخدام</h1>
      <p className="text-sm text-muted-foreground mb-8">آخر تحديث: يونيو 2026</p>

      <div className="space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">١. قبول الشروط</h2>
          <p className="text-muted-foreground">
            باستخدامك لمنصة <span className="text-gradient-gold font-semibold">قسطك</span>، فإنك توافق على هذه الشروط. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٢. وصف الخدمة</h2>
          <p className="text-muted-foreground">
            قسطك هي منصة إلكترونية لإدارة التقسيط والمدفوعات والعملاء، موجهة للتجار وأصحاب الشركات الصغيرة. توفر المنصة أدوات لتتبع الأقساط، إدارة العملاء، والتحصيل الذكي.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٣. حسابات المستخدمين</h2>
          <p className="text-muted-foreground">أنت مسؤول عن:</p>
          <ul className="list-disc pr-5 mt-2 space-y-1 text-muted-foreground">
            <li>الحفاظ على سرية معلومات حسابك</li>
            <li>جميع الأنشطة التي تحدث تحت حسابك</li>
            <li>إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٤. الخطط والاشتراكات</h2>
          <p className="text-muted-foreground">
            نوفر خطط اشتراك مختلفة (مجاني، أساسي، احترافي، غير محدود). تخضع المدفوعات لشروط وأحكام Stripe (معالج الدفع). قد نقوم بتغيير أسعار الاشتراك مع إشعار مسبق.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٥. استخدام مقبول</h2>
          <p className="text-muted-foreground">أنت توافق على عدم:</p>
          <ul className="list-disc pr-5 mt-2 space-y-1 text-muted-foreground">
            <li>استخدام المنصة لأي غرض غير قانوني</li>
            <li>محاولة اختراق أمن المنصة أو الوصول غير المصرح به</li>
            <li>إساءة استخدام الخدمة أو التدخل في عملها</li>
            <li>استخدام المنصة في أنشطة احتيالية</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٦. إخلاء مسؤولية</h2>
          <p className="text-muted-foreground">
            تقدم المنصة "كما هي" دون أي ضمانات. نحن غير مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٧. إنهاء الخدمة</h2>
          <p className="text-muted-foreground">
            يحق لنا إنهاء أو تعليق حسابك في حال انتهاك شروط الاستخدام. يمكنك إنهاء حسابك في أي وقت عن طريق التواصل معنا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٨. تعديل الشروط</h2>
          <p className="text-muted-foreground">
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بالتغييرات الجوهرية عبر البريد الإلكتروني.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٩. الاتصال بنا</h2>
          <p className="text-muted-foreground">
            للاستفسارات المتعلقة بشروط الاستخدام، يرجى التواصل عبر: <span dir="ltr" className="font-mono">01206363468</span>
          </p>
        </section>
      </div>
    </div>
  )
}
