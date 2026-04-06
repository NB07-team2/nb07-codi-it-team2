/*
  Warnings:

  - Changed the type of `name` on the `category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProductcCategoryName" AS ENUM ('all', 'top', 'bottom', 'dress', 'outer', 'skirt', 'shoes', 'acc');

-- DropIndex
DROP INDEX "review_userId_productId_key";

-- AlterTable
ALTER TABLE "category" DROP COLUMN "name",
ADD COLUMN     "name" "ProductcCategoryName" NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "image" SET DEFAULT 'https://codi-it-s3.s3.amazonaws.com/others/b7220551-54e3-414f-bed1-801a44e71d45.png';

-- DropEnum
DROP TYPE "CategoryName";

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");
