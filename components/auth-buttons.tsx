"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export function AuthButtons({ header, hero }: { header?: boolean; hero?: boolean }) {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  if (isLoggedIn) {
    return (
      <>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
          {session.user.merchantId || ""}
        </span>
        <Link
          href="/dashboard"
            className={hero ? "btn-gold text-xs sm:text-sm !py-1.5 sm:!py-2 !px-4 sm:!px-5" : "btn-gold text-xs !py-1.5 !px-3"}
        >
          لوحة التحكم
        </Link>
      </>
    )
  }

  if (hero) {
    return (
      <>
        <Link href="/register" className="btn-gold text-xs sm:text-sm !py-1.5 sm:!py-2 !px-4 sm:!px-5">
          ابدأ مجاناً
        </Link>
        <Link href="/login" className="btn-glass text-xs sm:text-sm !py-1.5 sm:!py-2 !px-4 sm:!px-5">
          <span className="sm:hidden">دخول</span><span className="hidden sm:inline">تسجيل الدخول</span>
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span className="sm:hidden">دخول</span><span className="hidden sm:inline">تسجيل الدخول</span>
      </Link>
        <Link href="/register" className="btn-gold text-xs !py-1.5 !px-3">
          ابدأ مجاناً
        </Link>
    </>
  )
}
