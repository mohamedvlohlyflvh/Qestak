"use server"

import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { calculateCollectionScore, type CollectionScoreResult } from "@/app/lib/collection-score"

export interface CollectionItem {
  contractId: string
  contractNumber: string
  customerName: string
  customerPhone: string
  totalCents: number
  paidCents: number
  overdueCents: number
  daysOverdue: number
  totalInstallments: number
  paidInstallments: number
  missedCount: number
  daysSinceLastPayment: number | null
  score: CollectionScoreResult
}

export async function getCollections(): Promise<CollectionItem[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const contracts = await prisma.contract.findMany({
    where: { merchantId: session.user.id },
    include: {
      customer: { select: { name: true, phone: true } },
      installments: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  const now = new Date()

  return contracts
    .map((c) => {
      const overdue = c.installments.filter((i) => i.status === "OVERDUE" || (i.status === "UPCOMING" && i.dueDate < now))
      const paid = c.installments.filter((i) => i.status === "PAID" || i.status === "PARTIAL")
      const pending = c.installments.filter((i) => i.status === "UPCOMING" || i.status === "PARTIAL")
      const daysSinceLastPayment = paid.length > 0
        ? Math.floor((now.getTime() - Math.max(...paid.map((i) => (i.paidDate || i.dueDate).getTime()))) / 86400000)
        : null

      const maxOverdueDays = overdue.length > 0
        ? Math.floor((now.getTime() - Math.min(...overdue.map((i) => i.dueDate.getTime()))) / 86400000)
        : 0

      const score = calculateCollectionScore({
        daysOverdue: maxOverdueDays,
        totalInstallments: c.installments.length,
        paidInstallments: paid.length,
        totalAmountCents: c.totalAmount,
        paidAmountCents: paid.reduce((s, i) => s + Number(i.amountPaid), 0),
        missedCount: overdue.length,
        daysSinceLastPayment,
      })

      return {
        contractId: c.id,
        contractNumber: c.contractNumber,
        customerName: c.customer.name,
        customerPhone: c.customer.phone,
        totalCents: c.totalAmount,
        paidCents: paid.reduce((s, i) => s + Number(i.amountPaid), 0),
        overdueCents: overdue.reduce((s, i) => s + Number(i.amount), 0),
        daysOverdue: maxOverdueDays,
        totalInstallments: c.installments.length,
        paidInstallments: paid.length,
        missedCount: overdue.length,
        daysSinceLastPayment,
        score,
      }
    })
    .sort((a, b) => b.score.score - a.score.score)
}
