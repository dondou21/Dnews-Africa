-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'EDITED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'RESTORED', 'COMMENTED', 'ASSIGNED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ArticleStatus" ADD VALUE 'IDEA';
ALTER TYPE "ArticleStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "ArticleStatus" ADD VALUE 'NEEDS_REVISION';
ALTER TYPE "ArticleStatus" ADD VALUE 'APPROVED';
ALTER TYPE "ArticleStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "assignedEditorId" TEXT,
ADD COLUMN     "changeReason" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImageId" TEXT,
    "changeReason" TEXT,
    "articleId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_comments" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "sectionReference" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorial_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_approvals" (
    "id" TEXT NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "notes" TEXT,
    "articleId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "fromStatus" "ArticleStatus",
    "toStatus" "ArticleStatus",
    "description" TEXT,
    "metadata" JSONB,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_revisions_articleId_version_key" ON "article_revisions"("articleId", "version");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_assignedEditorId_fkey" FOREIGN KEY ("assignedEditorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "editorial_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_approvals" ADD CONSTRAINT "editorial_approvals_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_approvals" ADD CONSTRAINT "editorial_approvals_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_audit_logs" ADD CONSTRAINT "article_audit_logs_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_audit_logs" ADD CONSTRAINT "article_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
