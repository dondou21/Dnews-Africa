import rateLimit from "express-rate-limit";
import { config } from "../config";

const standardResponse = {
  status: "error",
  message: "Too many requests. Please try again later.",
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardResponse,
});