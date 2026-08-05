import { Request, Response } from "express";
import { z } from "zod";
import { sponsorService } from "../services/sponsorService";
import { createSponsorSchema, updateSponsorSchema, sponsorQuerySchema } from "../validators/sponsorValidator";
import { ZodValidationError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";

function parseZod(schema: z.ZodSchema, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ZodValidationError(
      parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message }))
    );
  }
  return parsed.data;
}

export const sponsorController = {
  getActive: asyncHandler(async (_req: Request, res: Response) => {
    const sponsors = await sponsorService.getActive();
    res.json({ status: "success", data: sponsors });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const parsed = parseZod(sponsorQuerySchema, req.query);
    const result = await sponsorService.getAll(parsed);
    res.json({ status: "success", data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const sponsor = await sponsorService.getById(req.params.id);
    res.json({ status: "success", data: sponsor });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = parseZod(createSponsorSchema, req.body);
    const sponsor = await sponsorService.create(parsed);
    res.status(201).json({ status: "success", data: sponsor });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const parsed = parseZod(updateSponsorSchema, req.body);
    const sponsor = await sponsorService.update(req.params.id, parsed);
    res.json({ status: "success", data: sponsor });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await sponsorService.delete(req.params.id);
    res.json({ status: "success", data: null });
  }),
};
