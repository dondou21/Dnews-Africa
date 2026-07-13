import { Request, Response } from "express";
import { adCampaignService } from "../services/adCampaignService";
import { createAdCampaignSchema, updateAdCampaignSchema } from "../validators/adCampaignValidator";
import { AppError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";

export const adCampaignController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await adCampaignService.getAll(req.query as unknown as { page?: number; limit?: number; search?: string; status?: string; advertiserId?: string });
    res.json({ status: "success", data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await adCampaignService.getById(req.params.id);
    res.json({ status: "success", data: campaign });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createAdCampaignSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
    const campaign = await adCampaignService.create(parsed.data);
    res.status(201).json({ status: "success", data: campaign });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateAdCampaignSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
    const campaign = await adCampaignService.update(req.params.id, parsed.data);
    res.json({ status: "success", data: campaign });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await adCampaignService.delete(req.params.id);
    res.json({ status: "success", data: null });
  }),
};
