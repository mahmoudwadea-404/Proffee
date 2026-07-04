import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/user/role?email=xxx
 * Returns the user's role from the Prisma database.
 * Used by the Navbar to determine admin access.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ role: "CUSTOMER" })
    }

    return NextResponse.json({ role: user.role })
  } catch (error) {
    console.error("Error fetching user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
