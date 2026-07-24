import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const name = searchParams.get("name") || "User"
  const rawNext = searchParams.get("next")
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/"

  if (code) {
    const response = NextResponse.redirect(new URL(next, origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user && data.user.email) {
      try {
        const existing = await prisma.user.findUnique({
          where: { supabaseId: data.user.id },
          select: { id: true },
        })

        if (!existing) {
          await prisma.user.create({
            data: {
              supabaseId: data.user.id,
              name: name,
              email: data.user.email,
            },
          })
        }
      } catch (err) {
        console.error("Error syncing user to DB:", err)
      }

      return response
    }
  }

  return NextResponse.redirect(new URL("/admin/login?error=auth_failed", origin))
}
