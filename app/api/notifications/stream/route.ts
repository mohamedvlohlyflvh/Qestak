import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response(null, { status: 401 })
  const merchantId = session.user.id

  const encoder = new TextEncoder()
  let lastId = ""

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      send(JSON.stringify({ connected: true }))

      const interval = setInterval(async () => {
        try {
          const notif = await prisma.notification.findFirst({
            where: { merchantId, id: { gt: lastId } },
            orderBy: { createdAt: "desc" },
          })

          if (notif) {
            lastId = notif.id
            send(JSON.stringify({ type: "new", notification: notif }))
          }
        } catch {
          // ignore polling errors
        }
      }, 5000)

      const unreadInterval = setInterval(async () => {
        try {
          const count = await prisma.notification.count({
            where: { merchantId, isRead: false },
          })
          send(JSON.stringify({ type: "count", unread: count }))
        } catch {
          // ignore polling errors
        }
      }, 15000)

      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        clearInterval(unreadInterval)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
