"use server"

import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.notification.findMany({
    where: { merchantId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getUnreadCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  return prisma.notification.count({
    where: { merchantId: session.user.id, isRead: false },
  })
}

export async function markAsRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.notification.update({ where: { id, merchantId: session.user.id }, data: { isRead: true } })
  revalidatePath("/dashboard/notifications")
  return { success: true }
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.notification.updateMany({
    where: { merchantId: session.user.id, isRead: false },
    data: { isRead: true },
  })
  revalidatePath("/dashboard/notifications")
  return { success: true }
}

export async function createNotification(
  title: string,
  message: string,
  priority: "LOW" | "MEDIUM" | "HIGH" = "LOW"
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.notification.create({
    data: { title, message, priority, merchantId: session.user.id },
  })

  revalidatePath("/dashboard/notifications")
  return { success: true }
}
