"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export function AuthButtons({ header, hero }: { header?: boolean; hero?: boolean }) {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className={hero ? "btn-gold text-sm sm:text-base !py-3 sm:!py-4 !px-6 sm:!px-10" : "btn-gold text-sm !py-2 !px-5"}
      >
        الانتقال إلى لوحة التحكم
      </Link>
    )
  }

  if (hero) {
    return (
      <>
        <Link href="/register" className="btn-gold text-sm sm:text-base !py-3 sm:!py-4 !px-6 sm:!px-10">
          ابدأ مجاناً
        </Link>
        <Link href="/login" className="btn-glass text-sm sm:text-base !py-3 sm:!py-4 !px-6 sm:!px-10">
          تسجيل الدخول
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        تسجيل الدخول
      </Link>
      <Link href="/register" className="btn-gold text-sm !py-2 !px-5">
        ابدأ مجاناً
      </Link>
    </>
  )
}
