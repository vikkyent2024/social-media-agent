-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'approved', 'posted');

-- AlterTable
ALTER TABLE "SocialPost" ALTER COLUMN "status" TYPE "PostStatus" USING "status"::"PostStatus";
ALTER TABLE "SocialPost" ALTER COLUMN "status" SET DEFAULT 'draft';
