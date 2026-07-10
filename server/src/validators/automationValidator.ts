import { z } from "zod";

export const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  sendDay: z.number().int().min(0).max(6).optional(),
  sendTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format"),
  timezone: z.string().optional(),
  templateId: z.string().uuid("Invalid template"),
  enabled: z.boolean().optional(),
});

export const updateAutomationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  sendDay: z.number().int().min(0).max(6).optional(),
  sendTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format").optional(),
  timezone: z.string().optional(),
  templateId: z.string().uuid("Invalid template").optional(),
  enabled: z.boolean().optional(),
});
