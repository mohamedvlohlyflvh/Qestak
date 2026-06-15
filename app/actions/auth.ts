"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { registerSchema } from "@/app/lib/validations"

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

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      storeName: storeName || null,
      phone: phone || null,
    },
  })

  return { success: true }
}
