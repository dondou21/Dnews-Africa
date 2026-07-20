-- Add missing author columns to articles table
-- These were supposed to be in migration 20260717151216_add_manual_author_fields but were omitted
ALTER TABLE "articles" ADD COLUMN "authorName" TEXT;
ALTER TABLE "articles" ADD COLUMN "authorPosition" TEXT;
ALTER TABLE "articles" ADD COLUMN "authorOrganization" TEXT;
