-- ===== WALLET SYSTEM TABLES =====

-- CreateEnum for WalletTransactionType
CREATE TYPE "WalletTransactionType" AS ENUM ('TOP_UP', 'PURCHASE', 'REFUND', 'ADMIN_CREDIT', 'ADMIN_DEBIT');

-- CreateEnum for WalletTransactionStatus
CREATE TYPE "WalletTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum for TopUpStatus
CREATE TYPE "TopUpStatus" AS ENUM ('PENDING', 'PAYMENT_SUBMITTED', 'VERIFIED', 'REJECTED', 'CANCELLED');

-- CreateEnum for MessageSender
CREATE TYPE "MessageSender" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');

-- CreateTable Wallet
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable WalletTransaction
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "topUpId" TEXT,
    "disputeId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable WalletTopUp
CREATE TABLE "WalletTopUp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProof" TEXT,
    "paymentReference" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrderReview
CREATE TABLE "OrderReview" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable DisputeMessage
CREATE TABLE "DisputeMessage" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" "MessageSender" NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id")
);

-- ===== ALTER ORDER TABLE =====

-- Alter Order table: change paymentMethod to String (nullable)
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE TEXT;
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET DEFAULT 'WALLET';

-- Add new fields to Order
ALTER TABLE "Order" ADD COLUMN "walletTransactionId" TEXT;

-- ===== ALTER DISPUTE TABLE =====

-- Add new fields to Dispute for chat and closure rules
ALTER TABLE "Dispute" ADD COLUMN "canAdminClose" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Dispute" ADD COLUMN "closedBy" TEXT;
ALTER TABLE "Dispute" ADD COLUMN "closedAt" TIMESTAMP(3);

-- ===== CREATE INDEXES =====

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex for WalletTransaction
CREATE INDEX "WalletTransaction_userId_idx" ON "WalletTransaction"("userId");
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");
CREATE INDEX "WalletTransaction_createdAt_idx" ON "WalletTransaction"("createdAt");

-- CreateIndex for WalletTopUp
CREATE INDEX "WalletTopUp_userId_idx" ON "WalletTopUp"("userId");
CREATE INDEX "WalletTopUp_status_idx" ON "WalletTopUp"("status");
CREATE INDEX "WalletTopUp_createdAt_idx" ON "WalletTopUp"("createdAt");

-- CreateIndex for OrderReview
CREATE UNIQUE INDEX "OrderReview_orderId_productId_key" ON "OrderReview"("orderId", "productId");
CREATE INDEX "OrderReview_productId_idx" ON "OrderReview"("productId");
CREATE INDEX "OrderReview_userId_idx" ON "OrderReview"("userId");

-- CreateIndex for DisputeMessage
CREATE INDEX "DisputeMessage_disputeId_idx" ON "DisputeMessage"("disputeId");
CREATE INDEX "DisputeMessage_createdAt_idx" ON "DisputeMessage"("createdAt");

-- ===== ADD FOREIGN KEYS =====

-- AddForeignKey for Wallet
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for WalletTransaction
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_topUpId_fkey" FOREIGN KEY ("topUpId") REFERENCES "WalletTopUp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for WalletTopUp
ALTER TABLE "WalletTopUp" ADD CONSTRAINT "WalletTopUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for Order
ALTER TABLE "Order" ADD CONSTRAINT "Order_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for OrderReview
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for DisputeMessage
ALTER TABLE "DisputeMessage" ADD CONSTRAINT "DisputeMessage_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
