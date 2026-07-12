import fs from "fs";
import path from "path";
import { mediaRepository } from "../repositories/mediaRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";
import { config } from "../config";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
      `Invalid file type: ${file.mimetype}. Only JPG, PNG, and WebP images are accepted`,
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

export function getMediaPublicUrl(filename: string): string {
  return `${config.mediaBaseUrl}/${filename}`;
}

export function formatMediaResponse(media: MediaRecord): MediaResponse & { uploadedBy?: { id: string; firstName: string; lastName: string } } {
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
    type: media.type,
    createdAt: media.createdAt,
  };
}

export function formatFeaturedImage(
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

    const media = await mediaRepository.create({
      url: `/uploads/${file.filename}`,
      alt: altText,
      type: "IMAGE",
      fileSize: file.size,
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      extension: ext,
      storageProvider: "local",
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

    const filename = media.filename || path.basename(media.url);
    const filePath = path.join(config.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file ${filePath}:`, err);
      }
    }

    await mediaRepository.delete(id);
  },
};
