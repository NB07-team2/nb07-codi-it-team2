/*
  Warnings:

  - The `status` column on the `inquiry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `address` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usePoint` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeId` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InquiryStatusType" AS ENUM ('WaitingAnswer', 'CompletedAnswer');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('WaitingPayment', 'CompletedPayment');

-- DropForeignKey
ALTER TABLE "inquiry" DROP CONSTRAINT "inquiry_userId_fkey";

-- AlterTable
ALTER TABLE "inquiry" DROP COLUMN "status",
ADD COLUMN     "status" "InquiryStatusType" NOT NULL DEFAULT 'WaitingAnswer';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "subtotal" INTEGER NOT NULL,
ADD COLUMN     "totalQuantity" INTEGER NOT NULL,
ADD COLUMN     "usePoint" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "sizeId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "StatusType";

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'WaitingPayment',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_orderId_key" ON "payment"("orderId");

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
