import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import SessionProvider from "@/components/session-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Qestak — منصة تقسيط ذكية", template: "%s | Qestak" },
  description: "منصة تقسيط ذكية لإدارة الأقساط والمدفوعات والعملاء — حل متكامل للتجار والشركات الصغيرة",
  keywords: ["تقسيط", "أقساط", "إدارة ديون", "تحصيل", "Qestak"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Qestak — منصة تقسيط ذكية",
    description: "منصة تقسيط ذكية لإدارة الأقساط والمدفوعات والعملاء",
    type: "website",
    locale: "ar_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem("theme");
                if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                  document.documentElement.classList.add("dark");
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <SessionProvider>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
