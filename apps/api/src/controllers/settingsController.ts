import { Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settingsService";

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
      const settings = await settingsService.update(req.body);
      res.json({ status: "success", data: settings });
    } catch (error) {
      next(error);
    }
  },
};
