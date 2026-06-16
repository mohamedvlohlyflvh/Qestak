"use server"

import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"

export async function setContractLimit(userId: string, limit: number | null) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!admin?.isAdmin) return { error: "Forbidden" }

  await prisma.user.update({
    where: { id: userId },
    data: { contractLimit: limit },
  })

  return { success: true }
}
