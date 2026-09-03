import { Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settingsService";
import { updateSettingsSchema } from "../validators/settingsValidator";
import { ZodValidationError } from "../middlewares/errorHandler";

export const settingsController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.get();
      res.json({ status: "success", data: settings });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })));
      }
      const settings = await settingsService.update(parsed.data);
      res.json({ status: "success", data: settings });
    } catch (error) {
      next(error);
    }
  },
};
