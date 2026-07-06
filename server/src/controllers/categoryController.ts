import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService";

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
