import { Request, Response, NextFunction } from "express";
import { campaignService } from "../services/campaignService";
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignQuerySchema,
  scheduleCampaignSchema,
} from "../validators/campaignValidator";
import { AppError } from "../middlewares/errorHandler";

export const campaignController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = campaignQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const result = await campaignService.getAll(parsed.data);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await campaignService.getById(id);
      res.json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createCampaignSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const campaign = await campaignService.create(parsed.data, req.user!);
      res.status(201).json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateCampaignSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const campaign = await campaignService.update(id, parsed.data, req.user!);
      res.json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await campaignService.delete(id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await campaignService.send(id, req.user!);
      res.json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = scheduleCampaignSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const campaign = await campaignService.schedule(id, parsed.data.scheduledAt, req.user!);
      res.json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await campaignService.cancel(id, req.user!);
      res.json({ status: "success", data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await campaignService.getStats();
      res.json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  },
};
