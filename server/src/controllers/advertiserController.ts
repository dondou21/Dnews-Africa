import { Request, Response, NextFunction } from "express";
import { advertiserService } from "../services/advertiserService";
import { createAdvertiserSchema, updateAdvertiserSchema } from "../validators/advertiserValidator";
import { AppError } from "../middlewares/errorHandler";

export const advertiserController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await advertiserService.getAll(req.query as any);
      res.json({ status: "success", data: result });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const advertiser = await advertiserService.getById(req.params.id);
      res.json({ status: "success", data: advertiser });
    } catch (error) { next(error); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAdvertiserSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const advertiser = await advertiserService.create(parsed.data);
      res.status(201).json({ status: "success", data: advertiser });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAdvertiserSchema.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
      const advertiser = await advertiserService.update(req.params.id, parsed.data);
      res.json({ status: "success", data: advertiser });
    } catch (error) { next(error); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await advertiserService.delete(req.params.id);
      res.json({ status: "success", data: null });
    } catch (error) { next(error); }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const advertisers = await advertiserService.list();
      res.json({ status: "success", data: advertisers });
    } catch (error) { next(error); }
  },
};
