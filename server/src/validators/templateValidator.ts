import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
  subject: z.string().min(1, "Subject is required").max(300),
  content: z.string().min(1, "Content is required"),
  thumbnail: z.string().url().optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  subject: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});
