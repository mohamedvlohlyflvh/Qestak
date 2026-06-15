import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
}

export default function PrivacyPage() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← العودة للرئيسية</Link>
      <h1 className="text-3xl font-bold mb-2">سياسة الخصوصية</h1>
      <p className="text-sm text-muted-foreground mb-8">آخر تحديث: يونيو 2026</p>

      <div className="space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">١. مقدمة</h2>
          <p className="text-muted-foreground">
            نحن في <span className="text-gradient-gold font-semibold">قسطك</span> نلتزم بحماية خصوصية مستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصتنا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٢. المعلومات التي نجمعها</h2>
          <p className="text-muted-foreground">قد نجمع الأنواع التالية من المعلومات:</p>
          <ul className="list-disc pr-5 mt-2 space-y-1 text-muted-foreground">
            <li>معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف، اسم المتجر</li>
            <li>معلومات العملاء والعقود التي تقوم بإدخالها في المنصة</li>
            <li>بيانات الاستخدام: الصفحات التي تزورها، الوقت المستغرق، ونمط الاستخدام</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٣. كيفية استخدام المعلومات</h2>
          <p className="text-muted-foreground">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
          <ul className="list-disc pr-5 mt-2 space-y-1 text-muted-foreground">
            <li>تقديم وتحسين خدمات المنصة</li>
            <li>معالجة الاشتراكات والمدفوعات عبر Stripe</li>
            <li>إرسال إشعارات تذكير بالمدفوعات للعملاء</li>
            <li>تحسين تجربة المستخدم وتطوير الميزات</li>
            <li>التواصل معك بشأن حسابك وخدماتنا</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٤. حماية البيانات</h2>
          <p className="text-muted-foreground">
            نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. يتم تشفير البيانات الحساسة وتخزينها بشكل آمن.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٥. مشاركة البيانات مع الغير</h2>
          <p className="text-muted-foreground">
            نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة، باستثناء:
          </p>
          <ul className="list-disc pr-5 mt-2 space-y-1 text-muted-foreground">
            <li>معالج الدفع Stripe لمعالجة المدفوعات</li>
            <li>إذا كان الإفصاح مطلوباً بموجب القانون</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٦. حقوقك</h2>
          <p className="text-muted-foreground">لديك الحق في:</p>
          <ul className="list-disc pr-5 mt-2 space-y-1 text-muted-foreground">
            <li>الوصول إلى بياناتك الشخصية وتصحيحها</li>
            <li>طلب حذف بياناتك</li>
            <li>الاعتراض على معالجة بياناتك</li>
            <li>سحب الموافقة في أي وقت</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">٧. الاتصال بنا</h2>
          <p className="text-muted-foreground">
            إذا كانت لديك أي استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا عبر رقم الدعم: <span dir="ltr" className="font-mono">01206363468</span>
          </p>
        </section>
      </div>
    </div>
  )
}
