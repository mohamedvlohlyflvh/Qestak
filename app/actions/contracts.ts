"use server"

import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
import { PLANS, FREE_CONTRACT_LIMIT } from "@/app/lib/stripe"

export async function getContracts() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.contract.findMany({
    where: { merchantId: session.user.id },
    include: { customer: true, _count: { select: { installments: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getContract(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.contract.findFirst({
    where: { id, merchantId: session.user.id },
    include: {
      customer: true,
      guarantor: true,
      installments: { orderBy: { dueDate: "asc" } },
    },
  })
}

export async function createContract(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const merchantId = session.user.id

  const merchant = await prisma.user.findUnique({ where: { id: merchantId } })
  if (!merchant) return { error: "Merchant not found" }

  if (merchant.contractLimit !== null) {
    const totalContracts = await prisma.contract.count({ where: { merchantId } })
    if (totalContracts >= merchant.contractLimit) {
      return { error: "لقد استنفدت حد العقود المسموح به. تواصل مع المشرف." }
    }
  }

  const plan = PLANS[merchant.plan as keyof typeof PLANS] || PLANS.FREE

  if (plan.id === "FREE") {
    const totalContracts = await prisma.contract.count({ where: { merchantId } })
    if (totalContracts >= FREE_CONTRACT_LIMIT) {
      await prisma.notification.create({
        data: {
          title: "تم بلوغ الحد الأقصى",
          message: `لقد استنفدت الـ ${FREE_CONTRACT_LIMIT} عقود المجانية. اشترك في إحدى خططنا للمتابعة.`,
          priority: "HIGH",
          merchantId,
        },
      })
      revalidatePath("/dashboard/notifications")
      return { error: `لقد استنفدت الـ ${FREE_CONTRACT_LIMIT} عقود المجانية. اشترك في إحدى خططنا للمتابعة.` }
    }
    if (totalContracts === FREE_CONTRACT_LIMIT - 1) {
      await prisma.notification.create({
        data: {
          title: "اقتراب من الحد الأقصى",
          message: `لديك عقد مجاني واحد متبقي. قم بالاشتراك في إحدى خططنا للمتابعة بعد ذلك.`,
          priority: "MEDIUM",
          merchantId,
        },
      })
      revalidatePath("/dashboard/notifications")
    }
  } else {
    const weeklyCount = await prisma.contract.count({
      where: { merchantId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    })
    const limit = plan.contractsPerWeek
    if (typeof limit === "number" && weeklyCount >= limit) {
      await prisma.notification.create({
        data: {
          title: "تم بلوغ الحد الأقصى",
          message: `لقد تجاوزت الحد الأسبوعي لعقود خطتك (${limit} عقد/أسبوع).`,
          priority: "HIGH",
          merchantId,
        },
      })
      revalidatePath("/dashboard/notifications")
      return { error: `لقد تجاوزت الحد الأسبوعي لعقود خطتك (${limit} عقد/أسبوع).` }
    }
    const usagePercent = Math.round((weeklyCount / limit) * 100)
    if (usagePercent >= 90 && usagePercent < 100) {
      await prisma.notification.create({
        data: {
          title: "اقتراب من الحد الأقصى",
          message: `لقد استهلكت ${usagePercent}% من حدك الأسبوعي (${weeklyCount}/${limit}).`,
          priority: "MEDIUM",
          merchantId,
        },
      })
      revalidatePath("/dashboard/notifications")
    }
  }

  const customerId = formData.get("customerId") as string
  const totalAmountStr = formData.get("totalAmount") as string
  const downPaymentStr = formData.get("downPayment") as string
  const installmentCountStr = formData.get("installmentCount") as string
  const installmentIntervalStr = formData.get("installmentInterval") as string
  const interestRateStr = formData.get("interestRate") as string
  const guarantorName = formData.get("guarantorName") as string
  const guarantorNationalId = formData.get("guarantorNationalId") as string
  const guarantorPhone = formData.get("guarantorPhone") as string
  const guarantorAddress = formData.get("guarantorAddress") as string

  if (!customerId || !totalAmountStr || !installmentCountStr) {
    return { error: "جميع الحقول المطلوبة غير مكتملة" }
  }

  const customer = await prisma.customer.findFirst({ where: { id: customerId, merchantId: session.user.id } })
  if (!customer) return { error: "العميل غير صالح" }

  const totalAmount = Math.round(parseFloat(totalAmountStr) * 100) // store as piastres/cents
  const downPayment = Math.round(parseFloat(downPaymentStr || "0") * 100)
  const installmentCount = parseInt(installmentCountStr)

  if (isNaN(totalAmount) || totalAmount <= 0) return { error: "المبلغ الإجمالي غير صحيح" }
  if (isNaN(installmentCount) || installmentCount < 1) return { error: "عدد الأقساط غير صحيح" }

  const interestRate = interestRateStr ? parseFloat(interestRateStr) : 0
  const remainingAmount = totalAmount - downPayment
  if (remainingAmount <= 0) return { error: "يجب أن يكون المبلغ المتبقي أكبر من صفر" }

  const totalWithInterest = interestRate > 0 ? Math.round(remainingAmount * (1 + interestRate / 100)) : remainingAmount

  const baseInstallment = Math.floor(totalWithInterest / installmentCount)
  const remainder = totalWithInterest - baseInstallment * installmentCount

  const installments: { amount: number; dueDate: Date }[] = []
  const intervalDays = parseInt(installmentIntervalStr) || 30
  const now = new Date()

  for (let i = 0; i < installmentCount; i++) {
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + (i + 1) * intervalDays)
    // last installment absorbs the remainder for penny-accurate totals
    const amount = i === installmentCount - 1 ? baseInstallment + remainder : baseInstallment
    installments.push({ amount, dueDate })
  }

  const contractNumber = `QST-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

  try {
    await prisma.$transaction(async (tx) => {
      await tx.contract.create({
        data: {
          contractNumber,
          totalAmount,
          downPayment,
          remainingAmount,
          interestRate: interestRate > 0 ? interestRate : null,
          installmentInterval: intervalDays !== 30 ? intervalDays : undefined,
          merchantId,
          customerId,
          installments: {
            create: installments.map((inst) => ({
              amount: inst.amount,
              dueDate: inst.dueDate,
              status: "UPCOMING",
            })),
          },
          ...(guarantorName
            ? {
                guarantor: {
                  create: {
                    name: guarantorName,
                    nationalId: guarantorNationalId,
                    phone: guarantorPhone,
                    address: guarantorAddress || undefined,
                  },
                },
              }
            : {}),
        },
      })

      await tx.notification.create({
        data: {
          title: "تم إنشاء عقد جديد",
          message: `تم إنشاء العقد ${contractNumber} بنجاح بقيمة ${(totalAmount / 100).toLocaleString("ar-EG")} ج.م`,
          priority: "LOW",
          merchantId,
        },
      })
    })

    revalidatePath("/dashboard/contracts")
    return { success: true as const }
  } catch (e) {
    return { error: "حدث خطأ أثناء إنشاء العقد: " + (e instanceof Error ? e.message : "خطأ غير معروف") }
  }
}

export async function updateInstallmentStatus(installmentId: string, status: string, amountPaid?: number) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { contract: { select: { merchantId: true, totalAmount: true } } },
  })
  if (!installment || installment.contract.merchantId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      status: status as any,
      amountPaid: amountPaid ? (installment.amountPaid || 0) + Math.round(amountPaid * 100) : (status === "PAID" ? installment.amount : undefined),
      paidDate: status === "PAID" || status === "PARTIAL" ? new Date() : undefined,
    },
  })

  const allPaid = await prisma.installment.findFirst({
    where: { contractId: installment.contractId, status: { notIn: ["PAID", "PARTIAL"] } },
  })
  if (!allPaid) {
    await prisma.contract.update({
      where: { id: installment.contractId },
      data: { status: "COMPLETED" },
    })
  }

  revalidatePath("/dashboard/contracts")
  return { success: true }
}

export async function updateContract(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const contract = await prisma.contract.findFirst({
    where: { id, merchantId: session.user.id },
  })
  if (!contract) return { error: "Unauthorized" }

  const totalAmountStr = formData.get("totalAmount") as string
  const downPaymentStr = formData.get("downPayment") as string
  const interestRateStr = formData.get("interestRate") as string
  const customerId = formData.get("customerId") as string

  if (!totalAmountStr || !customerId) return { error: "جميع الحقول المطلوبة غير مكتملة" }

  const customer = await prisma.customer.findFirst({ where: { id: customerId, merchantId: session.user.id } })
  if (!customer) return { error: "العميل غير صالح" }

  const totalAmount = Math.round(parseFloat(totalAmountStr) * 100)
  const downPayment = Math.round(parseFloat(downPaymentStr || "0") * 100)
  const interestRate = interestRateStr ? parseFloat(interestRateStr) : 0
  const remainingAmount = totalAmount - downPayment
  if (remainingAmount <= 0) return { error: "يجب أن يكون المبلغ المتبقي أكبر من صفر" }

  try {
    await prisma.contract.update({
      where: { id },
      data: {
        totalAmount,
        downPayment,
        remainingAmount,
        interestRate: interestRate > 0 ? interestRate : null,
        customerId,
      },
    })
    revalidatePath("/dashboard/contracts")
    return { success: true }
  } catch (e) {
    return { error: "حدث خطأ أثناء تحديث العقد: " + (e instanceof Error ? e.message : "خطأ غير معروف") }
  }
}

export async function deleteContract(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const contract = await prisma.contract.findFirst({
    where: { id, merchantId: session.user.id },
  })
  if (!contract) return { error: "Unauthorized" }

  await prisma.contract.delete({ where: { id } })
  revalidatePath("/dashboard/contracts")
  return { success: true }
}
