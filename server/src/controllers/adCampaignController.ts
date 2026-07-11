import { Request, Response, NextFunction } from "express";
import { adCampaignService } from "../services/adCampaignService";
import { createAdCampaignSchema, updateAdCampaignSchema } from "../validators/adCampaignValidator";
import { AppError } from "../middlewares/errorHandler";

export const adCampaignController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adCampaignService.getAll(req.query as any);
      res.json({ status: "success", data: result });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await adCampaignService.getById(req.params.id);
      res.json({ status: "success", data: campaign });
    } catch (error) { next(error); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAdCampaignSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const campaign = await adCampaignService.create(parsed.data);
      res.status(201).json({ status: "success", data: campaign });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAdCampaignSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const campaign = await adCampaignService.update(req.params.id, parsed.data as any);
      res.json({ status: "success", data: campaign });
    } catch (error) { next(error); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await adCampaignService.delete(req.params.id);
      res.json({ status: "success", data: null });
    } catch (error) { next(error); }
  },
};
