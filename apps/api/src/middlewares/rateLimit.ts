import rateLimit from "express-rate-limit";
import { config } from "../config";

const standardResponse = {
  status: "error",
  message: "Too many requests. Please try again later.",
};

const isTest = process.env.NODE_ENV === "test";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100000 : (config.isProduction ? 100 : 1000),
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 100000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 100000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 100000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 100000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});
