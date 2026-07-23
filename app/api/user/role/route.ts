import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

/**
 * GET /api/user/role
 * Returns the authenticated user's own role. No longer accepts email parameter.
 */
export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ role: "CUSTOMER" })
  }

  return NextResponse.json({ role: user.role })
}
