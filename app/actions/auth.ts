"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const storeName = formData.get("storeName") as string
  const phone = formData.get("phone") as string

  if (!name || !email || !password) {
    return { error: "جميع الحقول المطلوبة غير مكتملة" }
  }

  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }
  }

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
