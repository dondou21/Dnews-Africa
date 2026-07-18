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

export class ValidationError extends AppError {
  errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    const firstMessage = Object.values(errors)[0] || "Validation failed";
    super(firstMessage, 400);
    this.errors = errors;
  }
}

export class ZodValidationError extends ValidationError {
  constructor(zodErrors: { path: string; message: string }[]) {
    const errors: Record<string, string> = {};
    for (const err of zodErrors) {
      if (!errors[err.path]) {
        errors[err.path] = err.message;
      }
    }
    super(errors);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Prisma error:", err.code, err.meta);
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[]) || [];
      return res.status(409).json({
        success: false,
        message: `A record with this ${target.join(", ")} already exists`,
        error: "unique_constraint",
      });
    }
    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Referenced record not found",
        error: "foreign_key_violation",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Database constraint error",
      error: err.code,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message: config.isProduction ? "Internal server error" : err.message,
  });
};
