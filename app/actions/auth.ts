"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { registerSchema } from "@/app/lib/validations"

async function generateMerchantId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const id = Math.floor(1000000 + Math.random() * 9000000).toString()
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
    return { error: "البريد الإلكتروني مسجل بالفعل" }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const merchantId = await generateMerchantId()

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

  return { success: true }
}
