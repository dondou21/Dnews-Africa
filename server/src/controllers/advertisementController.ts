import { Request, Response, NextFunction } from "express";
import { advertisementService } from "../services/advertisementService";
import { createAdSchema, updateAdSchema } from "../validators/advertisementValidator";
import { AppError } from "../middlewares/errorHandler";

export const advertisementController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await advertisementService.getAll(req.query as any);
      res.json({ status: "success", data: result });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.getById(req.params.id);
      res.json({ status: "success", data: ad });
    } catch (error) { next(error); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAdSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const ad = await advertisementService.create(parsed.data, req.user!);
      res.status(201).json({ status: "success", data: ad });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAdSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const ad = await advertisementService.update(req.params.id, parsed.data, req.user!);
      res.json({ status: "success", data: ad });
    } catch (error) { next(error); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await advertisementService.delete(req.params.id);
      res.json({ status: "success", data: null });
    } catch (error) { next(error); }
  },

  async getByPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const { placement } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 1;
      const ads = await advertisementService.getByPlacement(placement, limit);
      res.json({ status: "success", data: ads });
    } catch (error) { next(error); }
  },

  async trackImpression(req: Request, res: Response) {
    await advertisementService.trackImpression(req.params.id);
    res.json({ status: "success" });
  },

  async trackClick(req: Request, res: Response) {
    await advertisementService.trackClick(req.params.id);
    const ad = await advertisementService.getById(req.params.id);
    res.redirect(301, ad.targetUrl);
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await advertisementService.getStats();
      res.json({ status: "success", data: stats });
    } catch (error) { next(error); }
  },

  async publicServe(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) { next(error); }
  },
};
