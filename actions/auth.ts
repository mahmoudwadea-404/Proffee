"use server"

import { prisma } from "@/lib/prisma"

export async function createUserInDB({
  supabaseId,
  name,
  email,
}: {
  supabaseId: string
  name: string
  email: string
}) {
  try {
  const existing = await prisma.user.findUnique({
    where: { supabaseId },
    select: { id: true },
  })

    if (existing) {
      return { success: true, user: existing }
    }

    const user = await prisma.user.create({
      data: {
        supabaseId,
        name,
        email,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error("Error creating user in DB:", error)
    return { success: false, error: "An error occurred while creating your account" }
  }
}

export async function getPrismaUserId(supabaseId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    })
    return user?.id ?? null
  } catch (error) {
    console.error("Error resolving Prisma user ID:", error)
    return null
  }
}
