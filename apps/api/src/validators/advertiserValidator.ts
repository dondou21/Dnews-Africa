import { z } from "zod";

export const createAdvertiserSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  contactName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateAdvertiserSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  contactName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.string().optional(),
});
