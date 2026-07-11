import { Request, Response, NextFunction } from "express";
import { layoutService } from "../services/layoutService";
import { AppError } from "../middlewares/errorHandler";
import { createLayoutSchema, updateLayoutSchema, duplicateLayoutSchema } from "../validators/layoutValidator";

export const layoutController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const result = await layoutService.getAll(page, limit, search, status);
      res.json({ status: "success", data: result });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const layout = await layoutService.getById(id);
      res.json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const layout = await layoutService.getBySlug(slug);
      res.json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const layout = await layoutService.getPublished();
      res.json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createLayoutSchema.parse(req.body);
      const layout = await layoutService.create(parsed as any, req.user!);
      res.status(201).json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateLayoutSchema.parse(req.body);
      const layout = await layoutService.update(id, parsed, req.user!);
      res.json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await layoutService.delete(id);
      res.json({ status: "success", data: null });
    } catch (error) { next(error); }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const layout = await layoutService.publish(id);
      res.json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = duplicateLayoutSchema.parse(req.body);
      const layout = await layoutService.duplicate(id, parsed, req.user!);
      res.status(201).json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },

  async saveSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sections } = req.body;
      if (!Array.isArray(sections)) throw new AppError("Sections must be an array", 400);
      const layout = await layoutService.saveSections(id, sections);
      res.json({ status: "success", data: layout });
    } catch (error) { next(error); }
  },
};
