import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    const customer = await prisma.customer.findFirst({
      where: { id, merchantId: session.user.id },
    })
    if (!customer) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(customer)
  }

  const customers = await prisma.customer.findMany({
    where: { merchantId: session.user.id },
    select: { id: true, name: true, nationalId: true, phone: true },
    orderBy: { name: "asc" },
  })

  return Response.json(customers)
}
