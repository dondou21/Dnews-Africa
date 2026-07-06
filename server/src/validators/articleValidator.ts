import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().url("Invalid URL").optional(),
  coverImageAlt: z.string().optional(),
  categoryId: z.number().int().positive("Category is required"),
  authorId: z.string().uuid("Valid author ID is required"),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleQuerySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(["latest", "oldest", "title_asc", "title_desc"]).optional().default("latest"),
});
