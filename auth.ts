import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"

// Validate required environment variables
if (!process.env.AUTH_SECRET) {
  console.error("ERROR: AUTH_SECRET environment variable is required for security")
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET environment variable is required")
  }
}

if (!process.env.CRON_SECRET || process.env.CRON_SECRET === "change-me-to-a-random-secret") {
  console.warn("WARNING: CRON_SECRET is not set or using default value. Change it in production!")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 }, // سنة
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.storeName,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { isAdmin: true, merchantId: true } })
        token.isAdmin = dbUser?.isAdmin ?? false
        token.merchantId = dbUser?.merchantId ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) ?? false
        session.user.merchantId = (token.merchantId as string | null) ?? null
      }
      return session
    },
  },
})
