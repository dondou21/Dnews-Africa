import { Request, Response, NextFunction } from "express";
import { articleService } from "../services/articleService";
import { createArticleSchema, updateArticleSchema, articleQuerySchema } from "../validators/articleValidator";
import { AppError } from "../middlewares/errorHandler";

export const articleController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = articleQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError("Invalid query parameters", 400);
      }
      const result = await articleService.getAll(parsed.data);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = articleQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError("Invalid query parameters", 400);
      }
      const status = req.query.status as string | undefined;
      const result = await articleService.getAllAdmin({ ...parsed.data, status }, req.user!);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const article = await articleService.getBySlug(slug);
      res.json({ status: "success", data: article });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await articleService.getById(id);
      res.json({ status: "success", data: article });
    } catch (error) {
      next(error);
    }
  },

  async getFeatured(_req: Request, res: Response, next: NextFunction) {
    try {
      const articles = await articleService.getFeatured();
      res.json({ status: "success", data: articles });
    } catch (error) {
      next(error);
    }
  },

  async getLatest(_req: Request, res: Response, next: NextFunction) {
    try {
      const articles = await articleService.getLatest();
      res.json({ status: "success", data: articles });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createArticleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const article = await articleService.create(parsed.data, req.user!);
      res.status(201).json({ status: "success", data: article });
    } catch (error) {
      next(error);
    }
  },

  async submitForReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await articleService.submitForReview(id, req.user!);
      res.json({ status: "success", data: article });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateArticleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const article = await articleService.update(id, parsed.data, req.user!);
      res.json({ status: "success", data: article });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await articleService.delete(id, req.user!);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
