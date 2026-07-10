import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("A valid email address is required"),
  name: z.string().max(200).optional(),
  source: z.enum(["HOME_PAGE", "FOOTER", "ARTICLE", "POPUP", "MANUAL"]).optional(),
});

export const verifyQuerySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const unsubscribeSchema = z.object({
  email: z.string().email("A valid email address is required"),
});

export const subscriberQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
});

export const updateSubscriberSchema = z.object({
  status: z.enum(["ACTIVE", "PENDING", "BLOCKED", "UNSUBSCRIBED"]).optional(),
  name: z.string().max(200).optional(),
});
