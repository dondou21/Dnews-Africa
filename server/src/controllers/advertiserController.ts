import { Request, Response } from "express";
import { advertiserService } from "../services/advertiserService";
import { createAdvertiserSchema, updateAdvertiserSchema } from "../validators/advertiserValidator";
import { AppError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";

export const advertiserController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await advertiserService.getAll(req.query as unknown as { page?: number; limit?: number; search?: string; status?: string });
    res.json({ status: "success", data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserService.getById(req.params.id);
    res.json({ status: "success", data: advertiser });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createAdvertiserSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
    const advertiser = await advertiserService.create(parsed.data);
    res.status(201).json({ status: "success", data: advertiser });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateAdvertiserSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);
    const advertiser = await advertiserService.update(req.params.id, parsed.data);
    res.json({ status: "success", data: advertiser });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await advertiserService.delete(req.params.id);
    res.json({ status: "success", data: null });
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const advertisers = await advertiserService.list();
    res.json({ status: "success", data: advertisers });
  }),
};
