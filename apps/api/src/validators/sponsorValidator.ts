import { z } from "zod";

const urlSchema = z.string().min(1, "URL is required").url("Must be a valid URL");

export const createSponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logoUrl: urlSchema,
  websiteUrl: urlSchema,
  altText: z.string().nullish(),
  displayOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateSponsorSchema = createSponsorSchema.partial();

export const sponsorQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  search: z.string().optional(),
});
