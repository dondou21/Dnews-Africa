import { Request, Response, NextFunction } from "express";
import { contactService } from "../services/contactService";
import { createContactSchema } from "../validators/contactValidator";
import { AppError } from "../middlewares/errorHandler";

export const contactController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createContactSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const message = await contactService.create(parsed.data);
      res.status(201).json({ status: "success", data: message });
    } catch (error) {
      next(error);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await contactService.getAll();
      res.json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },
};
