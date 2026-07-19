import fs from "fs";
import path from "path";
import { mediaRepository } from "../repositories/mediaRepository";
import { cloudinaryService } from "./cloudinaryService";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";
import { config } from "../config";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface MediaResponse {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  originalName: string | null;
  filename: string | null;
  mimeType: string | null;
  extension: string | null;
  storageProvider: string;
  publicId: string | null;
  type: string;
  createdAt: Date;
}

interface MediaRecord {
  id: string;
  url: string;
  alt: string | null;
  type: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  originalName: string | null;
  filename: string | null;
  mimeType: string | null;
  extension: string | null;
  storageProvider: string;
  publicId: string | null;
  uploadedById: string;
  createdAt: Date;
  uploadedBy?: { id: string; firstName: string; lastName: string } | null;
}

interface FeaturedImageRef {
  id: string;
  url: string;
  alt: string | null;
}

async function validateFile(file: Express.Multer.File): Promise<void> {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new AppError(
      `Invalid file type: ${file.mimetype}. Only JPG, PNG, WebP, and AVIF images are accepted`,
      400
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      400
    );
  }

  if (file.size === 0) {
    throw new AppError("Uploaded file is empty", 400);
  }
}

function getMediaPublicUrl(filename: string): string {
  const clean = filename.replace(/^\/+/, "");
  return `${config.mediaBaseUrl}/${clean}`;
}

function formatMediaResponse(media: MediaRecord): MediaResponse & { uploadedBy?: { id: string; firstName: string; lastName: string } } {
  return {
    id: media.id,
    url: media.url.startsWith("http")
      ? media.url
      : getMediaPublicUrl(path.basename(media.url)),
    alt: media.alt,
    width: media.width,
    height: media.height,
    fileSize: media.fileSize,
    originalName: media.originalName,
    filename: media.filename,
    mimeType: media.mimeType,
    extension: media.extension,
    storageProvider: media.storageProvider,
    publicId: media.publicId,
    type: media.type,
    createdAt: media.createdAt,
  };
}

function formatFeaturedImage(
  media: FeaturedImageRef | null
): FeaturedImageRef | null {
  if (!media) return null;
  return {
    id: media.id,
    url: media.url.startsWith("http")
      ? media.url
      : getMediaPublicUrl(path.basename(media.url)),
    alt: media.alt,
  };
}

export const mediaService = {
  async upload(file: Express.Multer.File, user: AuthenticatedUser): Promise<MediaResponse> {
    await validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const altText = file.originalname
      .replace(ext, "")
      .replace(/[-_]/g, " ")
      .trim();

    let url: string;
    let storageProvider = "local";
    let publicId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;

    if (config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret) {
      try {
        const result = await cloudinaryService.upload(file.buffer, file.mimetype, "articles");
        url = result.secure_url;
        storageProvider = "cloudinary";
        publicId = result.public_id;
        width = result.width;
        height = result.height;
      } catch {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(config.uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        url = `/uploads/${filename}`;
      }
    } else {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(config.uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      url = `/uploads/${filename}`;
    }

    const media = await mediaRepository.create({
      url,
      alt: altText,
      type: "IMAGE",
      fileSize: file.size,
      width,
      height,
      originalName: file.originalname,
      mimeType: file.mimetype,
      extension: ext,
      storageProvider,
      publicId,
      uploadedById: user.id,
    });

    return formatMediaResponse(media);
  },

  async getAll(): Promise<(MediaResponse & { uploadedBy?: { id: string; firstName: string; lastName: string } })[]> {
    const mediaList = await mediaRepository.findAll();
    return mediaList.map(formatMediaResponse);
  },

  async getById(id: string): Promise<MediaResponse & { uploadedBy?: { id: string; firstName: string; lastName: string } }> {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw new AppError("Media not found", 404);
    }
    return formatMediaResponse(media);
  },

  async delete(id: string, user: AuthenticatedUser): Promise<void> {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw new AppError("Media not found", 404);
    }

    if (user.role.name !== "ADMIN" && user.role.name !== "EDITOR") {
      throw new AppError("Insufficient permissions", 403);
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
          console.error(`Failed to delete file ${filePath}:`, err);
        }
      }
    }

    await mediaRepository.delete(id);
  },
};
