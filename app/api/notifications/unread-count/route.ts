import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ count: 0 })

  const count = await prisma.notification.count({
    where: { merchantId: session.user.id, isRead: false },
  })

  return Response.json({ count })
}
