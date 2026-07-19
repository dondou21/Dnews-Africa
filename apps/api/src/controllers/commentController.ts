import { Request, Response, NextFunction } from "express";
import { commentService } from "../services/commentService";
import {
  createCommentSchema,
  updateCommentStatusSchema,
  articleIdParamSchema,
  commentIdParamSchema,
} from "../validators/commentValidator";
import { AppError } from "../middlewares/errorHandler";

export const commentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const params = articleIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError("Invalid article ID", 400);
      }

      const parsed = createCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }

      const comment = await commentService.create({
        ...parsed.data,
        articleId: params.data.id,
        user: req.user,
      });

      res.status(201).json({ status: "success", data: comment });
    } catch (error) {
      next(error);
    }
  },

  async getByArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const params = articleIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError("Invalid article ID", 400);
      }

      const comments = await commentService.getByArticle(params.data.id);
      res.json({ status: "success", data: comments });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = commentIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError("Invalid comment ID", 400);
      }

      const comment = await commentService.getById(params.data.id);
      res.json({ status: "success", data: comment });
    } catch (error) {
      next(error);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getAll();
      res.json({ status: "success", data: comments });
    } catch (error) {
      next(error);
    }
  },

  async getPending(_req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getPending();
      res.json({ status: "success", data: comments });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const params = commentIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError("Invalid comment ID", 400);
      }

      const parsed = updateCommentStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }

      const comment = await commentService.updateStatus(params.data.id, parsed.data.status);
      res.json({ status: "success", data: comment });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = commentIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError("Invalid comment ID", 400);
      }

      await commentService.delete(params.data.id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};