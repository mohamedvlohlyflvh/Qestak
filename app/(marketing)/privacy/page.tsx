import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
}

export default function PrivacyPage() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-xs text-primary hover:underline mb-3 inline-block">← العودة للرئيسية</Link>
      <h1 className="text-2xl font-bold mb-1">سياسة الخصوصية</h1>
      <p className="text-xs text-muted-foreground mb-4">آخر تحديث: يونيو 2026</p>

      <div className="space-y-3 text-xs text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-1">١. مقدمة</h2>
          <p className="text-muted-foreground">
            نحن في <span className="text-gradient-gold font-semibold">قسطك</span> نلتزم بحماية خصوصية مستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصتنا.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-1">٢. المعلومات التي نجمعها</h2>
          <p className="text-muted-foreground">قد نجمع الأنواع التالية من المعلومات:</p>
          <ul className="list-disc pr-4 mt-1 space-y-0.5 text-muted-foreground">
            <li>معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف، اسم المتجر</li>
            <li>معلومات العملاء والعقود التي تقوم بإدخالها في المنصة</li>
            <li>بيانات الاستخدام: الصفحات التي تزورها، الوقت المستغرق، ونمط الاستخدام</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-1">٣. كيفية استخدام المعلومات</h2>
          <p className="text-muted-foreground">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
          <ul className="list-disc pr-4 mt-1 space-y-0.5 text-muted-foreground">
            <li>تقديم وتحسين خدمات المنصة</li>
            <li>معالجة الاشتراكات والمدفوعات</li>
            <li>إرسال إشعارات تذكير بالمدفوعات للعملاء</li>
            <li>تحسين تجربة المستخدم وتطوير الميزات</li>
            <li>التواصل معك بشأن حسابك وخدماتنا</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-1">٤. حماية البيانات</h2>
          <p className="text-muted-foreground">
            نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. يتم تشفير البيانات الحساسة وتخزينها بشكل آمن.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-1">٥. مشاركة البيانات مع الغير</h2>
          <p className="text-muted-foreground">
            نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة، باستثناء:
          </p>
          <ul className="list-disc pr-4 mt-1 space-y-0.5 text-muted-foreground">
            <li>معالجات الدفع المعتمدة لمعالجة المدفوعات</li>
            <li>إذا كان الإفصاح مطلوباً بموجب القانون</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-1">٦. حقوقك</h2>
          <p className="text-muted-foreground">لديك الحق في:</p>
          <ul className="list-disc pr-4 mt-1 space-y-0.5 text-muted-foreground">
            <li>الوصول إلى بياناتك الشخصية وتصحيحها</li>
            <li>طلب حذف بياناتك</li>
            <li>الاعتراض على معالجة بياناتك</li>
            <li>سحب الموافقة في أي وقت</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-1">٧. الاتصال بنا</h2>
          <p className="text-muted-foreground">
            للاستفسارات حول سياسة الخصوصية، تواصل عبر: <span dir="ltr" className="font-mono">01206363468</span>
          </p>
        </section>
      </div>
    </div>
  )
}
