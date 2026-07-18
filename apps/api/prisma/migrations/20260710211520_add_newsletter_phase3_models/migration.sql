-- CreateEnum
CREATE TYPE "AutomationFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "newsletter_campaign_recipients" ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "openedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "newsletter_campaigns" ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "totalClicked" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalOpened" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "newsletter_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_automations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "AutomationFrequency" NOT NULL,
    "sendDay" INTEGER,
    "sendTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "templateId" TEXT NOT NULL,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_analytics" (
    "id" TEXT NOT NULL,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "bounced" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_opens" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "newsletter_opens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_clicks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "articleId" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,

    CONSTRAINT "newsletter_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_settings" (
    "id" SERIAL NOT NULL,
    "senderName" TEXT NOT NULL DEFAULT 'Dnews Africa',
    "senderEmail" TEXT NOT NULL DEFAULT 'noreply@dnewsafrica.com',
    "replyToEmail" TEXT NOT NULL DEFAULT 'noreply@dnewsafrica.com',
    "companyName" TEXT NOT NULL DEFAULT 'Dnews Africa',
    "footerText" TEXT NOT NULL DEFAULT 'Follow us for the latest African stories.',
    "logoUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "defaultTemplateId" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialLinkedin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "newsletter_templates" ADD CONSTRAINT "newsletter_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_automations" ADD CONSTRAINT "newsletter_automations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "newsletter_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "newsletter_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_analytics" ADD CONSTRAINT "newsletter_analytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_opens" ADD CONSTRAINT "newsletter_opens_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_clicks" ADD CONSTRAINT "newsletter_clicks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
