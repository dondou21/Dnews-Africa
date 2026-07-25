-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "featuredImageCreditUrl" TEXT,
ADD COLUMN     "featuredImageAiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredImageAiDisclosure" TEXT;