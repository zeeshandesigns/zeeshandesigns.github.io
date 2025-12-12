-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "regionId" TEXT;

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
