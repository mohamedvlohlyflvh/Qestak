import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const dashboardPattern = /^\/dashboard/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!dashboardPattern.test(pathname)) return NextResponse.next()

  const sessionCookie =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/dashboard/:path*",
}
