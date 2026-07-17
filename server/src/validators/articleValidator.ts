import { z } from "zod";

const futureDate = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return;
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date format" });
    return;
  }
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date < tomorrow) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "The publication date must be a future date." });
  }
};

const articleBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().optional(),
  coverImageAlt: z.string().optional(),
  featuredImageId: z.string().uuid().optional(),
  categoryId: z.number().int().positive("Category is required"),
  status: z.enum(["IDEA", "DRAFT", "IN_REVIEW", "NEEDS_REVISION", "APPROVED", "SCHEDULED", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  authorName: z.string().optional(),
  authorPosition: z.string().optional(),
  authorOrganization: z.string().optional(),
});

export const createArticleSchema = articleBaseSchema.superRefine((data, ctx) => {
  futureDate(data.scheduledAt, ctx);
});

export const updateArticleSchema = articleBaseSchema.partial().superRefine((data, ctx) => {
  futureDate(data.scheduledAt, ctx);
});

export const articleQuerySchema = z.object({
  category: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(["latest", "oldest", "title_asc", "title_desc"]).optional().default("latest"),
});
