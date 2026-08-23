"use server"

import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { PLANS, FREE_CONTRACT_LIMIT } from "@/app/lib/plans"
import { PlanStatus } from "@/prisma/generated/client"

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

export async function setUserPlan(userId: string, plan: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!admin?.isAdmin) return { error: "Forbidden" }

  const validPlans = ["FREE", "BASIC", "PRO", "UNLIMITED"]
  if (!validPlans.includes(plan)) return { error: "Invalid plan" }

  // Auto-set contractLimit to match the plan's contract allowance
  let contractLimit: number | null
  if (plan === "FREE") {
    contractLimit = FREE_CONTRACT_LIMIT
  } else {
    const planConfig = PLANS[plan as keyof typeof PLANS]
    contractLimit = planConfig.contractsPerWeek === Infinity ? null : planConfig.contractsPerWeek
  }

  await prisma.user.update({
    where: { id: userId },
    data: { plan: plan as PlanStatus, contractLimit },
  })

  return { success: true }
}
