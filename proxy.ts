import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request)

  // Protect Account routes
  if (!user && request.nextUrl.pathname.startsWith("/account")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Protect Admin routes (authentication check)
  // Exclude /admin/login itself from being redirected
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/user/:path*"],
}
