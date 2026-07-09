import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidator";
import { AppError } from "../middlewares/errorHandler";

export const categoryController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      res.json({ status: "success", data: categories });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await categoryService.getBySlug(slug);
      res.json({ status: "success", data: category });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) throw new AppError("Invalid category ID", 400);
      const category = await categoryService.getById(id);
      res.json({ status: "success", data: category });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const category = await categoryService.create(parsed.data);
      res.status(201).json({ status: "success", data: category });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) throw new AppError("Invalid category ID", 400);
      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const category = await categoryService.update(id, parsed.data);
      res.json({ status: "success", data: category });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) throw new AppError("Invalid category ID", 400);
      await categoryService.delete(id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async getArticlesBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const articles = await categoryService.getArticlesBySlug(slug);
      res.json({ status: "success", data: articles });
    } catch (error) {
      next(error);
    }
  },
};
