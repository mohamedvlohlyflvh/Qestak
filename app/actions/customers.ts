"use server"

import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.customer.findMany({
    where: { merchantId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contracts: true } } },
  })
}

export async function getCustomer(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.customer.findFirst({
    where: { id, merchantId: session.user.id },
    include: {
      contracts: {
        include: {
          _count: { select: { installments: true } },
          installments: { select: { id: true, status: true, dueDate: true, amountPaid: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function createCustomer(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const nationalId = formData.get("nationalId") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const jobTitle = formData.get("jobTitle") as string

  if (!name || !nationalId || !phone || !address) {
    return { error: "جميع الحقول المطلوبة غير مكتملة" }
  }

  const existing = await prisma.customer.findUnique({ where: { nationalId } })
  if (existing) return { error: "رقم الهوية الوطنية مسجل مسبقاً" }

  await prisma.customer.create({
    data: { name, nationalId, phone, address, jobTitle: jobTitle || null, merchantId: session.user.id },
  })

  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function updateCustomer(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const existing = await prisma.customer.findFirst({
    where: { id, merchantId: session.user.id },
  })
  if (!existing) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const jobTitle = formData.get("jobTitle") as string

  if (!name || !phone || !address) return { error: "جميع الحقول المطلوبة غير مكتملة" }

  await prisma.customer.update({
    where: { id },
    data: { name, phone, address, jobTitle: jobTitle || null },
  })

  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const existing = await prisma.customer.findFirst({
    where: { id, merchantId: session.user.id },
  })
  if (!existing) return { error: "Unauthorized" }

  await prisma.customer.delete({ where: { id } })
  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function updateNotificationChannel(
  customerId: string,
  channel: "IN_APP"
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.customer.update({
    where: { id: customerId, merchantId: session.user.id },
    data: { notificationChannel: channel },
  })

  revalidatePath(`/dashboard/customers/${customerId}`)
  return { success: true }
}
