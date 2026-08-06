-- Create the drafts table for article auto-save / session recovery.

CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "formKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "drafts_userId_formKey_key" ON "drafts"("userId", "formKey");
CREATE INDEX "drafts_userId_updatedAt_idx" ON "drafts"("userId", "updatedAt");

ALTER TABLE "drafts" ADD CONSTRAINT "drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
