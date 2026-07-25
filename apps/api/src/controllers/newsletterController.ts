import { Request, Response, NextFunction } from "express";
import { newsletterService } from "../services/newsletterService";
import {
  subscribeSchema,
  verifyQuerySchema,
  unsubscribeSchema,
  unsubscribeByTokenSchema,
  subscriberQuerySchema,
  updateSubscriberSchema,
} from "../validators/newsletterValidator";
import { AppError } from "../middlewares/errorHandler";

export const newsletterController = {
  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = subscribeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }

      const ipAddress = (req.ip || req.socket.remoteAddress || null) as string | null;
      const userAgent = (req.headers["user-agent"] || null) as string | null;

      const subscriber = await newsletterService.subscribe({
        ...parsed.data,
        ipAddress,
        userAgent,
      });

      if (subscriber && "id" in subscriber && subscriber.id === "blocked") {
        res.json({ status: "success", data: { message: "Subscription received" } });
        return;
      }

      res.status(201).json({ status: "success", data: subscriber });
    } catch (error) {
      next(error);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifyQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const subscriber = await newsletterService.verify(parsed.data.token);
      res.json({ status: "success", data: subscriber });
    } catch (error) {
      next(error);
    }
  },

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = unsubscribeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      await newsletterService.unsubscribeByEmail(parsed.data.email);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async unsubscribeByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = unsubscribeByTokenSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      await newsletterService.unsubscribeByToken(parsed.data.token);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async resubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = unsubscribeByTokenSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      await newsletterService.resubscribe(parsed.data.token);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = subscriberQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const result = await newsletterService.getAll(parsed.data);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subscriber = await newsletterService.getById(id);
      res.json({ status: "success", data: subscriber });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateSubscriberSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const subscriber = await newsletterService.update(id, parsed.data);
      res.json({ status: "success", data: subscriber });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await newsletterService.delete(id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await newsletterService.getStats();
      res.json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  },

  async resendConfirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await newsletterService.resendConfirmation(id);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
