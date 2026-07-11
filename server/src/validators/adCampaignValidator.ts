import { z } from "zod";

export const createAdCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  advertiserId: z.string().uuid("Invalid advertiser"),
  budget: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateAdCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  advertiserId: z.string().uuid().optional(),
  budget: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});
