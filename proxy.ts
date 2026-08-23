import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("authjs.session-token")?.value
    || request.cookies.get("__Secure-authjs.session-token")?.value

  // If no session token, redirect to /login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
