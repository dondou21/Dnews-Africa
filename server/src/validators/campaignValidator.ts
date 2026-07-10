import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().min(1, "Subject is required").max(300),
  content: z.string().default(""),
  plainText: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(300).optional(),
  content: z.string().optional(),
  plainText: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "SCHEDULED", "CANCELLED"]).optional(),
});

export const campaignQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const scheduleCampaignSchema = z.object({
  scheduledAt: z.string().min(1, "Scheduled date is required"),
});
