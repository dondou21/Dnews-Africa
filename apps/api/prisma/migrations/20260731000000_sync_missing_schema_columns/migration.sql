-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "featuredImageCaption" TEXT,
ADD COLUMN     "featuredImageCopyright" TEXT,
ADD COLUMN     "featuredImageCredit" TEXT,
ADD COLUMN     "featuredImageDateTaken" TIMESTAMP(3),
ADD COLUMN     "featuredImageDescription" TEXT,
ADD COLUMN     "featuredImageLocation" TEXT,
ADD COLUMN     "featuredImageSource" TEXT,
ADD COLUMN     "newsletterSentAt" TIMESTAMP(3),
ADD COLUMN     "sendNewsletter" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "featuredImageAiGenerated" DROP NOT NULL;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "article_newsletter_deliveries" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_newsletter_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_newsletter_recipients" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_newsletter_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_newsletter_deliveries_articleId_key" ON "article_newsletter_deliveries"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "article_newsletter_recipients_deliveryId_subscriberId_key" ON "article_newsletter_recipients"("deliveryId", "subscriberId");

-- AddForeignKey
ALTER TABLE "article_newsletter_deliveries" ADD CONSTRAINT "article_newsletter_deliveries_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_newsletter_recipients" ADD CONSTRAINT "article_newsletter_recipients_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "article_newsletter_deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
