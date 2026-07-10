import { Request, Response, NextFunction } from "express";
import { automationService } from "../services/automationService";
import { createAutomationSchema, updateAutomationSchema } from "../validators/automationValidator";
import { AppError } from "../middlewares/errorHandler";

export const automationController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const automations = await automationService.getAll();
      res.json({ status: "success", data: automations });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const automation = await automationService.getById(req.params.id);
      res.json({ status: "success", data: automation });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAutomationSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const automation = await automationService.create(parsed.data);
      res.status(201).json({ status: "success", data: automation });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAutomationSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const automation = await automationService.update(req.params.id, parsed.data);
      res.json({ status: "success", data: automation });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await automationService.delete(req.params.id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async run(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await automationService.runAutomation(req.params.id);
      res.json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },
};
