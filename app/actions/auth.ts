"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { registerSchema } from "@/app/lib/validations"
import { signIn } from "@/auth"

async function generateMerchantId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const id = crypto.randomUUID().slice(0, 8).toUpperCase()
    const exists = await prisma.user.findUnique({ where: { merchantId: id } })
    if (!exists) return id
  }
  throw new Error("Failed to generate unique merchant ID")
}

export async function registerUser(formData: FormData) {
  const raw = Object.fromEntries(formData)

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError.message }
  }

  const { name, email, password, storeName, phone } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { exists: true }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const merchantId = await generateMerchantId()

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        storeName: storeName || null,
        phone: phone || null,
        merchantId,
      },
    })
  } catch {
    return { error: "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى." }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch {
    return { success: true, loginError: true }
  }

  return { success: true }
}
