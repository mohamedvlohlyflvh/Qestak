import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const url = process.env.DATABASE_URL!;
  const adapter = new PrismaPg(url);
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.findUnique({ where: { email: "admin@qestak.app" } });
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
    console.log("Set admin@qestak.app as admin");
  } else {
    console.log("admin@qestak.app not found");
  }

  const users = await prisma.user.findMany({ select: { email: true, merchantId: true, isAdmin: true } });
  for (const u of users) {
    console.log(`${u.email} — merchantId: ${u.merchantId}, admin: ${u.isAdmin}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
