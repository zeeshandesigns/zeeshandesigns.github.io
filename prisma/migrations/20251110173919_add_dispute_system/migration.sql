-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('CODE_NOT_WORKING', 'WRONG_CODE_RECEIVED', 'INCOMPLETE_DELIVERY', 'PAYMENT_ISSUES', 'REFUND_REQUEST', 'OTHER');

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "adminResponse" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "refundIssued" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dispute_orderId_idx" ON "Dispute"("orderId");

-- CreateIndex
CREATE INDEX "Dispute_userId_idx" ON "Dispute"("userId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
