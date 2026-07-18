-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "featuredImageId" TEXT;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "extension" TEXT,
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'local';

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
