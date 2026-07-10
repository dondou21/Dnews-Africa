import { Request, Response, NextFunction } from "express";
import { templateService } from "../services/templateService";
import { createTemplateSchema, updateTemplateSchema } from "../validators/templateValidator";
import { AppError } from "../middlewares/errorHandler";

export const templateController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.getAll();
      res.json({ status: "success", data: templates });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.getById(req.params.id);
      res.json({ status: "success", data: template });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createTemplateSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const template = await templateService.create(parsed.data, req.user!);
      res.status(201).json({ status: "success", data: template });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateTemplateSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const template = await templateService.update(req.params.id, parsed.data, req.user!);
      res.json({ status: "success", data: template });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await templateService.delete(req.params.id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.duplicate(req.params.id, req.user!);
      res.status(201).json({ status: "success", data: template });
    } catch (error) {
      next(error);
    }
  },
};
