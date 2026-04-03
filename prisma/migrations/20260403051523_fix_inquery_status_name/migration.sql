/*
  Warnings:

  - The `status` column on the `inquiry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('WaitingAnswer', 'CompletedAnswer');

-- AlterTable
ALTER TABLE "inquiry" DROP COLUMN "status",
ADD COLUMN     "status" "InquiryStatus" NOT NULL DEFAULT 'WaitingAnswer';

-- DropEnum
DROP TYPE "InquiryStatusType";
