import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export type AuthUser = {
  id: string
  supabaseId: string
  email: string
  role: string
}

/**
 * Get the current Supabase user from cookies. Returns null if not authenticated.
 * Works in Server Components, Server Actions, and Route Handlers.
 */
export async function getUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return null

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, supabaseId: true, email: true, role: true },
    })

    if (!dbUser) return null

    return {
      id: dbUser.id,
      supabaseId: dbUser.supabaseId,
      email: dbUser.email,
      role: dbUser.role,
    }
  } catch {
    return null
  }
}

/**
 * Require an authenticated user. Throws if not authenticated.
 * Use in Server Actions and Route Handlers that require login.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

/**
 * Require an authenticated admin user. Throws if not authenticated or not admin.
 * Use in every admin server action.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser()
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN")
  }
  return user
}
