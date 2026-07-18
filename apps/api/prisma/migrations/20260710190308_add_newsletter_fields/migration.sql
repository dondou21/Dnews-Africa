/*
  Warnings:

  - You are about to drop the column `isActive` on the `newsletter_subscribers` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `newsletter_subscribers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "NewsletterSource" AS ENUM ('HOME_PAGE', 'FOOTER', 'ARTICLE', 'POPUP', 'MANUAL');

-- AlterTable
ALTER TABLE "newsletter_subscribers" DROP COLUMN "isActive",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "source" "NewsletterSource",
ADD COLUMN     "status" "NewsletterStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
