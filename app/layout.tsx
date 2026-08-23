import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import SessionProvider from "@/components/session-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Qestak — منصة تقسيط ذكية", template: "%s | Qestak" },
  description: "منصة تقسيط ذكية لإدارة الأقساط والمدفوعات والعملاء — حل متكامل للتجار والشركات الصغيرة",
  keywords: ["تقسيط", "أقساط", "إدارة ديون", "تحصيل", "Qestak"],
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Qestak — منصة تقسيط ذكية",
    description: "منصة تقسيط ذكية لإدارة الأقساط والمدفوعات والعملاء",
    type: "website",
    locale: "ar_AR",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Qestak",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png" },
    ],
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
        <meta name="theme-color" content="#1e1e2e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Qestak" />
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
        <ServiceWorkerRegister />
        <SessionProvider>
            <div className="flex-1">{children}</div>
            <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
