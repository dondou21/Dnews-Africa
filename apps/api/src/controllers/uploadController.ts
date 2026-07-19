import { Request, Response, NextFunction } from "express";
import { cloudinaryService } from "../services/cloudinaryService";
import { mediaRepository } from "../repositories/mediaRepository";
import { AppError } from "../middlewares/errorHandler";

export const uploadController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const folder = (req.body.folder as string) || "articles";
      const validFolders = ["articles", "authors", "categories", "logos", "sponsors"];
      if (!validFolders.includes(folder)) {
        throw new AppError(`Invalid folder. Must be one of: ${validFolders.join(", ")}`, 400);
      }

      const result = await cloudinaryService.upload(
        req.file.buffer,
        req.file.mimetype,
        folder as "articles" | "authors" | "categories" | "logos" | "sponsors"
      );

      const media = await mediaRepository.create({
        url: result.secure_url,
        alt: req.body.alt || req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim(),
        type: "IMAGE",
        fileSize: req.file.size,
        width: result.width,
        height: result.height,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        extension: `.${result.format}`,
        storageProvider: "cloudinary",
        publicId: result.public_id,
        uploadedById: req.user!.id,
      });

      res.status(201).json({
        status: "success",
        data: {
          id: media.id,
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          originalName: req.file.originalname,
          createdAt: media.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new AppError("publicId is required", 400);
      }

      await cloudinaryService.delete(publicId);

      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
