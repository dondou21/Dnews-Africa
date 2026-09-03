import { z } from "zod";

export const updateSettingsSchema = z.object({
  senderName: z.string().max(200).optional(),
  senderEmail: z.string().email().optional(),
  replyToEmail: z.string().email().optional(),
  companyName: z.string().max(200).optional(),
  footerText: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional().nullable(),
  timezone: z.string().max(100).optional(),
  defaultTemplateId: z.string().uuid().optional().nullable(),
  socialFacebook: z.string().url().optional().nullable(),
  socialTwitter: z.string().url().optional().nullable(),
  socialInstagram: z.string().url().optional().nullable(),
  socialLinkedin: z.string().url().optional().nullable(),
});
