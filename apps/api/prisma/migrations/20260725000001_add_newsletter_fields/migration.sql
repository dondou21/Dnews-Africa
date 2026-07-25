-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "unsubscribeToken" TEXT,
ADD COLUMN     "userAgent" TEXT;