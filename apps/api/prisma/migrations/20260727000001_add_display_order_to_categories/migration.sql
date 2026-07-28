-- AlterTable: Add displayOrder to categories
ALTER TABLE "categories" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
