import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { rateLimit } from "@/lib/rate-limit"

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown"
    const key = `admin-login:${ip}`

    if (!rateLimit(key, MAX_ATTEMPTS, WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const message = error.message.includes("Invalid login")
        ? "Invalid email or password."
        : error.message.includes("Email not confirmed")
          ? "Please confirm your email first."
          : "Login failed. Please try again."
      return NextResponse.json({ error: message }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Login failed." }, { status: 401 })
    }

    return response
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
