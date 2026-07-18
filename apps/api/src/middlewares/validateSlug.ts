import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "./errorHandler";

const slugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const validateSlug = (req: Request, _res: Response, next: NextFunction) => {
  const result = slugSchema.safeParse(req.params);
  if (!result.success) {
    return next(new AppError("Invalid slug parameter", 400));
  }
  next();
};
