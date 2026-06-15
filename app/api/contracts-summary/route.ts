import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json([], { status: 401 })

  const contracts = await prisma.contract.findMany({
    where: { merchantId: session.user.id },
    select: { id: true, contractNumber: true, customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return Response.json(
    contracts.map((c) => ({ id: c.id, contractNumber: c.contractNumber, customerName: c.customer.name }))
  )
}
