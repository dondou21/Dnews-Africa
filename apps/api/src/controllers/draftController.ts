import { z } from "zod";
import { Request, Response } from "express";
import { draftService } from "../services/draftService";
import { draftParamsSchema, upsertDraftSchema } from "../validators/draftValidator";
import { ZodValidationError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";

function parseZod(schema: z.ZodSchema, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    throw new ZodValidationError(errors);
  }
  return parsed.data;
}

export const draftController = {
  getDraft: asyncHandler(async (req: Request, res: Response) => {
    const { formKey } = parseZod(draftParamsSchema, req.params);
    const draft = await draftService.getDraft(req.user!.id, formKey);
    res.json({ status: "success", data: draft });
  }),

  saveDraft: asyncHandler(async (req: Request, res: Response) => {
    const { formKey } = parseZod(draftParamsSchema, req.params);
    const parsed = parseZod(upsertDraftSchema, req.body);
    const draft = await draftService.saveDraft(req.user!.id, formKey, parsed);
    res.json({ status: "success", data: draft });
  }),

  deleteDraft: asyncHandler(async (req: Request, res: Response) => {
    const { formKey } = parseZod(draftParamsSchema, req.params);
    await draftService.deleteDraft(req.user!.id, formKey);
    res.json({ status: "success", data: null });
  }),
};
