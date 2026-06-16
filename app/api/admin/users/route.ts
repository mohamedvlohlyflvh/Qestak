import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || ""

  if (!q || q.length < 2) return NextResponse.json([])

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { merchantId: { startsWith: q } },
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      merchantId: true,
      name: true,
      email: true,
      contractLimit: true,
      plan: true,
      _count: { select: { contracts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json(users)
}
