import { Request, Response, NextFunction } from "express";
import { newsletterService } from "../services/newsletterService";
import { subscribeSchema } from "../validators/newsletterValidator";
import { AppError } from "../middlewares/errorHandler";

export const newsletterController = {
  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = subscribeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const subscriber = await newsletterService.subscribe(parsed.data);
      res.status(201).json({ status: "success", data: subscriber });
    } catch (error) {
      next(error);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const subscribers = await newsletterService.getAll();
      res.json({ status: "success", data: subscribers });
    } catch (error) {
      next(error);
    }
  },

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await newsletterService.unsubscribe(id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
