import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { config } from "../config";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error("Database connection failed:", err.message);
    return res.status(503).json({
      status: "error",
      message: "Database unavailable. Please try again later.",
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message: config.isProduction ? "Internal server error" : err.message,
  });
};
