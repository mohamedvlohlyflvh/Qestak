import { prisma } from "@/app/lib/prisma"

const ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "غير مصرح" }, { status: 401 })
  }
  try {
    const now = new Date()
    let overdueCount = 0
    let expiredCount = 0

    const overdueInstallments = await prisma.installment.findMany({
      where: { status: "UPCOMING", dueDate: { lt: now } },
      include: { contract: { include: { customer: true, merchant: true } } },
    })

    for (const inst of overdueInstallments) {
      await prisma.installment.update({
        where: { id: inst.id },
        data: { status: "OVERDUE" },
      })

      const existingNotification = await prisma.notification.findFirst({
        where: { message: { contains: inst.id.slice(0, 8) }, merchantId: inst.contract.merchantId, createdAt: { gte: new Date(now.getTime() - 86400000) } },
      })

      if (existingNotification) continue

      const daysOverdue = Math.floor((now.getTime() - inst.dueDate.getTime()) / 86400000)
      const title = daysOverdue >= 30 ? "قسط متأخر - حرج" : daysOverdue >= 7 ? "قسط متأخر" : "تنبيه قسط"
      const priority: typeof ALLOWED_PRIORITIES[number] = daysOverdue >= 30 ? "HIGH" : daysOverdue >= 7 ? "MEDIUM" : "LOW"

      await prisma.notification.create({
        data: {
          title,
          message: `القسط #${inst.id.slice(0, 8)} للعقد ${inst.contract.contractNumber} متأخر بـ ${daysOverdue} يوم (${(inst.amount / 100).toLocaleString("ar-EG")} ج.م)`,
          priority,
          merchantId: inst.contract.merchantId,
        },
      })

      overdueCount++
    }

    const expiredUsers = await prisma.user.findMany({
      where: {
        plan: { not: "FREE" },
        subscriptionEnds: { lt: now },
      },
      select: { id: true, storeName: true },
    })

    for (const user of expiredUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "FREE", stripeSubscriptionId: null, subscriptionEnds: null },
      })

      await prisma.notification.create({
        data: {
          title: "انتهى الاشتراك",
          message: `انتهت صلاحية اشتراك ${user.storeName || "حسابك"}. تم تحويلك إلى الخطة المجانية. جدد اشتراكك لاستعادة المزايا.`,
          priority: "HIGH",
          merchantId: user.id,
        },
      })

      expiredCount++
    }

    return Response.json({ overdueInstallments: overdueCount, expiredSubscriptions: expiredCount })
  } catch (err) {
    return Response.json({ error: "Overdue check failed" }, { status: 500 })
  }
}