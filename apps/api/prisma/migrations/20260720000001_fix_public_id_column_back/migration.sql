-- Revert the column rename: Prisma uses camelCase column names (publicId), not snake_case (public_id)
ALTER TABLE "media" RENAME COLUMN "public_id" TO "publicId";
