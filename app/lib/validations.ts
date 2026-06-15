import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100, "الاسم طويل جداً"),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100, "كلمة المرور طويلة جداً"),
  storeName: z.string().max(100, "اسم المتجر طويل جداً").optional().or(z.literal("")),
  phone: z.string().max(20, "رقم الهاتف طويل جداً").optional().or(z.literal("")),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
