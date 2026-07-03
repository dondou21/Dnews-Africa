import { Request, Response, NextFunction } from "express";

export const notFound = (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};
