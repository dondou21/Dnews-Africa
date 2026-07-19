import fs from "fs";
import path from "path";
import prisma from "./prisma";
import { config } from "../config";
import { cloudinaryService } from "../services/cloudinaryService";

export async function cleanupOrphanedMedia(mediaId: string): Promise<void> {
  const articleCount = await prisma.article.count({
    where: { featuredImageId: mediaId },
  });

  if (articleCount > 0) {
    return;
  }

  const adCount = await prisma.advertisement.count({
    where: { OR: [{ imageId: mediaId }, { videoId: mediaId }] },
  });

  if (adCount > 0) {
    return;
  }

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) {
    return;
  }

  if (media.storageProvider === "cloudinary" && media.publicId) {
    try {
      await cloudinaryService.delete(media.publicId);
    } catch (err) {
      console.error(`Failed to delete Cloudinary asset ${media.publicId}:`, err);
    }
  } else {
    const filename = media.filename || path.basename(media.url);
    const filePath = path.join(config.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete orphaned file ${filePath}:`, err);
      }
    }
  }

  try {
    await prisma.media.delete({ where: { id: mediaId } });
  } catch (err) {
    console.error(`Failed to delete orphaned media record ${mediaId}:`, err);
  }
}
