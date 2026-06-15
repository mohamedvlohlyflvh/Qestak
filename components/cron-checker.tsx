import { prisma } from "@/app/lib/prisma"
import { syncStripeSubscription } from "@/app/lib/stripe"

export function CronChecker() {
  runCronTasks().catch(() => {})
  return null
}

async function runCronTasks() {
  const now = new Date()
  const overdueInstallments = await prisma.installment.findMany({
    where: { status: "UPCOMING", dueDate: { lt: now } },
    include: { contract: { include: { customer: true, merchant: true } } },
  })

  for (const inst of overdueInstallments) {
    await prisma.installment.update({
      where: { id: inst.id },
      data: { status: "OVERDUE" },
    })

    const existing = await prisma.notification.findFirst({
      where: {
        message: { contains: inst.id.slice(0, 8) },
        merchantId: inst.contract.merchantId,
        createdAt: { gte: new Date(now.getTime() - 86400000) },
      },
    })

    if (existing) continue

    const daysOverdue = Math.floor((now.getTime() - inst.dueDate.getTime()) / 86400000)
    const title = daysOverdue >= 30 ? "قسط متأخر - حرج" : daysOverdue >= 7 ? "قسط متأخر" : "تنبيه قسط"
    const priority = daysOverdue >= 30 ? "HIGH" : daysOverdue >= 7 ? "MEDIUM" : "LOW"

    await prisma.notification.create({
      data: {
        title,
        message: `القسط #${inst.id.slice(0, 8)} للعقد ${inst.contract.contractNumber} متأخر بـ ${daysOverdue} يوم (${(inst.amount / 100).toLocaleString("ar-EG")} ج.م)`,
        priority,
        merchantId: inst.contract.merchantId,
      },
    })
  }

  const paidUsers = await prisma.user.findMany({
    where: { plan: { not: "FREE" }, stripeCustomerId: { not: null } },
    select: { id: true, stripeCustomerId: true },
  })
  for (const u of paidUsers) {
    await syncStripeSubscription(u.id, u.stripeCustomerId!)
  }

  const sevenDaysLater = new Date(now.getTime() + 7 * 86400000)

  const expiringSoon = await prisma.user.findMany({
    where: {
      plan: { not: "FREE" },
      subscriptionEnds: { gte: now, lte: sevenDaysLater },
    },
    select: { id: true, storeName: true, subscriptionEnds: true },
  })

  for (const user of expiringSoon) {
    const existing = await prisma.notification.findFirst({
      where: {
        title: "ينتهي الاشتراك قريباً",
        merchantId: user.id,
        createdAt: { gte: new Date(now.getTime() - 86400000) },
      },
    })

    if (existing) continue

    const daysLeft = Math.ceil((user.subscriptionEnds!.getTime() - now.getTime()) / 86400000)

    await prisma.notification.create({
      data: {
        title: "ينتهي الاشتراك قريباً",
        message: `تبقى ${daysLeft} يوم على انتهاء اشتراك ${user.storeName || "حسابك"}. جدد اشتراكك قبل الانتهاء لتفادي التحويل للخطة المجانية.`,
        priority: "HIGH",
        merchantId: user.id,
      },
    })
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
  }
}
