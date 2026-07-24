-- Add author override fields to articles
ALTER TABLE "articles" ADD COLUMN "authorName" TEXT;
ALTER TABLE "articles" ADD COLUMN "authorPosition" TEXT;
ALTER TABLE "articles" ADD COLUMN "authorOrganization" TEXT;
