import { Request, Response } from "express";
import { advertisementService } from "../services/advertisementService";
import { createAdSchema, updateAdSchema } from "../validators/advertisementValidator";
import { AppError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";

export const advertisementController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await advertisementService.getAll(req.query as unknown as { page?: number; limit?: number; search?: string; status?: string; placement?: string; type?: string; advertiserId?: string; campaignId?: string });
    res.json({ status: "success", data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ad = await advertisementService.getById(req.params.id);
    res.json({ status: "success", data: ad });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createAdSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
    const ad = await advertisementService.create(parsed.data, req.user!);
    res.status(201).json({ status: "success", data: ad });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateAdSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
    const ad = await advertisementService.update(req.params.id, parsed.data, req.user!);
    res.json({ status: "success", data: ad });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await advertisementService.delete(req.params.id);
    res.json({ status: "success", data: null });
  }),

  getByPlacement: asyncHandler(async (req: Request, res: Response) => {
    const { placement } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 1;
    const ads = await advertisementService.getByPlacement(placement, limit);
    res.json({ status: "success", data: ads });
  }),

  trackImpression: asyncHandler(async (req: Request, res: Response) => {
    await advertisementService.trackImpression(req.params.id);
    res.json({ status: "success" });
  }),

  trackClick: asyncHandler(async (req: Request, res: Response) => {
    await advertisementService.trackClick(req.params.id);
    const ad = await advertisementService.getById(req.params.id);
    res.redirect(301, ad.targetUrl);
  }),

  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await advertisementService.getStats();
    res.json({ status: "success", data: stats });
  }),

  publicServe: asyncHandler(async (req: Request, res: Response) => {
    const { placement } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 1;
    const ads = await advertisementService.getByPlacement(placement, limit);

    const result = await Promise.all(ads.map(async (ad) => {
      await advertisementService.trackImpression(ad.id);
      return {
        id: ad.id,
        title: ad.title,
        type: ad.type,
        placement: ad.placement,
        targetUrl: ad.targetUrl,
        imageUrl: ad.image?.url || null,
        imageAlt: ad.image?.alt || null,
        buttonText: ad.buttonText,
        description: ad.description,
      };
    }));

    res.json({ status: "success", data: result });
  }),
};
