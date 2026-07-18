import { Request, Response, NextFunction } from "express";
import { tagService } from "../services/tagService";
import { createTagSchema, updateTagSchema } from "../validators/tagValidator";
import { AppError } from "../middlewares/errorHandler";

export const tagController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await tagService.getAll();
      res.json({ status: "success", data: tags });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) throw new AppError("Invalid tag ID", 400);
      const tag = await tagService.getById(id);
      res.json({ status: "success", data: tag });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createTagSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const tag = await tagService.create(parsed.data);
      res.status(201).json({ status: "success", data: tag });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) throw new AppError("Invalid tag ID", 400);
      const parsed = updateTagSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const tag = await tagService.update(id, parsed.data);
      res.json({ status: "success", data: tag });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) throw new AppError("Invalid tag ID", 400);
      await tagService.delete(id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
