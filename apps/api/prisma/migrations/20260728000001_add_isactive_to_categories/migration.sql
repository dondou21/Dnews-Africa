-- AlterTable: Add isActive to categories
ALTER TABLE "categories" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
