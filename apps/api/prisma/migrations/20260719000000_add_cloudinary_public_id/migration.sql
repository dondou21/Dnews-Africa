-- Add publicId column to media table for Cloudinary integration
ALTER TABLE "media" ADD COLUMN "publicId" TEXT;

-- Create an index on publicId for faster lookups
CREATE INDEX IF NOT EXISTS "media_public_id_idx" ON "media" ("publicId");
