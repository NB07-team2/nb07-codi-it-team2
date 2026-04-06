/*
  Warnings:

  - Changed the type of `name` on the `category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProductCategoryName" AS ENUM ('all', 'top', 'bottom', 'dress', 'outer', 'skirt', 'shoes', 'acc');

-- AlterTable
ALTER TABLE "category" DROP COLUMN "name",
ADD COLUMN     "name" "ProductCategoryName" NOT NULL;

-- DropEnum
DROP TYPE "ProductcCategoryName";

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");
