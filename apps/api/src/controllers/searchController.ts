import { Request, Response, NextFunction } from "express";
import { searchService } from "../services/searchService";
import { searchQuerySchema } from "../validators/searchValidator";
import { AppError } from "../middlewares/errorHandler";

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = searchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const result = await searchService.search(parsed.data);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },
};
