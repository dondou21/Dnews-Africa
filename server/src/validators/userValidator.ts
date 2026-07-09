import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.number().int().positive("Role is required"),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Valid email is required").optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});
