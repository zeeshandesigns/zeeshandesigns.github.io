-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_VERIFIED', 'CODE_DELIVERED', 'WALLET_TOPUP', 'DISPUTE_UPDATE', 'REFUND_ISSUED', 'ADMIN_ORDER', 'ADMIN_PAYMENT', 'ADMIN_DISPUTE', 'SYSTEM_UPDATE');

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "isPaid" SET DEFAULT true;

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
