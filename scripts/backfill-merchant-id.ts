import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function generateUniqueId(prisma: PrismaClient): Promise<string> {
  while (true) {
    const id = Math.floor(1000000 + Math.random() * 9000000).toString();
    const existing = await prisma.user.findUnique({ where: { merchantId: id } });
    if (!existing) return id;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const adapter = new PrismaPg(url);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  for (const user of users) {
    if (!user.merchantId) {
      const merchantId = await generateUniqueId(prisma);
      await prisma.user.update({
        where: { id: user.id },
        data: { merchantId },
      });
      console.log(`Set merchantId ${merchantId} for ${user.email}`);
    }
  }

  // Make the first user an admin
  if (users.length > 0) {
    await prisma.user.update({
      where: { id: users[0].id },
      data: { isAdmin: true },
    });
    console.log(`Set ${users[0].email} as admin`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
