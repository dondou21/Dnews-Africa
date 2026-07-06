import { z } from "zod";

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Valid email is required").optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});
