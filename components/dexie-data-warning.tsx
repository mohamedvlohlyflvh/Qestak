"use client";

import { useState } from "react";
import { db } from "@/app/lib/dexie-db";

const WARNING_KEY = "qestak_data_warning_dismissed";

export function DexieDataWarning() {
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(WARNING_KEY);
    return !dismissed;
  });
  const [exporting, setExporting] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const [customers, contracts, installments, guarantors] = await Promise.all([
        db.customers.toArray(),
        db.contracts.toArray(),
        db.installments.toArray(),
        db.guarantors.toArray(),
      ]);

      const dump = {
        exportedAt: new Date().toISOString(),
        version: 1,
        data: { customers, contracts, installments, guarantors },
      };

      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qestak-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("فشل تصدير البيانات: " + (e instanceof Error ? e.message : "خطأ غير معروف"));
    }
    setExporting(false);
  }

  const dismissForever = () => {
    localStorage.setItem(WARNING_KEY, "true");
    setVisible(false);
  };

  const dismissSession = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t-2 border-amber-500 bg-amber-50 dark:bg-amber-950/90 shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm sm:text-base">
              ⚠️ تنبيه مهم: البيانات محفوظة محلياً فقط
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm mt-1 leading-relaxed">
              هذا التطبيق يخزن <strong>جميع البيانات</strong> (العملاء، العقود، الأقساط) في متصفحك باستخدام IndexedDb
              للعمل دون اتصال بالإنترنت.{" "}
              <strong>لا يوجد خادم خارجي</strong> لحفظ نسخة احتياطية.
            </p>
            <div className="mt-2 space-y-1 text-xs text-amber-600 dark:text-amber-400">
              <p>⚠️ <strong>مسح سجل التصفح أو حذف بيانات المتصفح</strong> سيؤدي إلى{" "}
                <strong className="text-red-600 dark:text-red-400">فقدان جميع البيانات بشكل نهائي</strong> — لا يمكن استعادتها.
              </p>
              <p>✅ قم <strong>بتصدير بياناتك</strong> بانتظام باستخدام الزر أدناه</p>
              <p>✅ بيانات الدخول (البريد الإلكتروني وكلمة المرور) فقط هي المحفوظة على الخادم</p>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <button
              onClick={exportData}
              disabled={exporting}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {exporting ? "جاري التصدير..." : "📥 تصدير البيانات"}
            </button>
            <button
              onClick={dismissForever}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-xs font-medium whitespace-nowrap transition-colors"
            >
              فهمت، لا تظهر مجدداً
            </button>
            <button
              onClick={dismissSession}
              className="px-3 py-1.5 border border-amber-300 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 text-xs whitespace-nowrap transition-colors"
            >
              تخطي لهذه الجلسة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
