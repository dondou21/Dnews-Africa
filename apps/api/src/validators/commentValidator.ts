import { z } from "zod";

export const createCommentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  content: z.string().min(1, "Content is required"),
});

export const updateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const articleIdParamSchema = z.object({
  id: z.string().uuid("Invalid article ID"),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid("Invalid comment ID"),
});