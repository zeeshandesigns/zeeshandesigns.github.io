/*
  Warnings:

  - You are about to drop the column `storeId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_storeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_storeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Store" DROP CONSTRAINT "Store_userId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "storeId";

-- DropTable
DROP TABLE "public"."Store";
