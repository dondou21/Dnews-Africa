import { mediaRepository } from "../repositories/mediaRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";

export const mediaService = {
  async upload(file: Express.Multer.File, user: AuthenticatedUser) {
    return mediaRepository.create({
      url: `/uploads/${file.filename}`,
      alt: file.originalname,
      type: "IMAGE",
      fileSize: file.size,
      uploadedById: user.id,
    });
  },

  async getAll() {
    return mediaRepository.findAll();
  },

  async getById(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw new AppError("Media not found", 404);
    }
    return media;
  },

  async delete(id: string, user: AuthenticatedUser) {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw new AppError("Media not found", 404);
    }

    if (user.role.name !== "ADMIN" && user.role.name !== "EDITOR") {
      throw new AppError("Insufficient permissions", 403);
    }

    return mediaRepository.delete(id);
  },
};
