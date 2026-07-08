import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboardService";

export const dashboardController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      res.json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  },
};