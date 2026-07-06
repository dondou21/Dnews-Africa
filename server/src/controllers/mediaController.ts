import { Request, Response, NextFunction } from "express";
import { mediaService } from "../services/mediaService";
import { mediaIdSchema } from "../validators/mediaValidator";
import { AppError } from "../middlewares/errorHandler";

export const mediaController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }
      const media = await mediaService.upload(req.file, req.user!);
      res.status(201).json({ status: "success", data: media });
    } catch (error) {
      next(error);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.getAll();
      res.json({ status: "success", data: media });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = mediaIdSchema.safeParse({ id });
      if (!parsed.success) {
        throw new AppError("Invalid media ID", 400);
      }
      const media = await mediaService.getById(id);
      res.json({ status: "success", data: media });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = mediaIdSchema.safeParse({ id });
      if (!parsed.success) {
        throw new AppError("Invalid media ID", 400);
      }
      await mediaService.delete(id, req.user!);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
