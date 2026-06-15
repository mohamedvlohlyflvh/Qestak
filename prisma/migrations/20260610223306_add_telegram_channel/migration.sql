-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'TELEGRAM', 'WHATSAPP');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "notificationChannel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
ADD COLUMN     "telegramChatId" TEXT;
