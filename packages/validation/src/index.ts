import { z } from "zod";

function futureDate(val: string | undefined, ctx: z.RefinementCtx) {
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
}

function validateAuthor(
  data: { authorUserId?: string; authorName?: string | null },
  ctx: z.RefinementCtx,
  isCreate: boolean
) {
  const touched = data.authorUserId !== undefined || data.authorName !== undefined;
  if (isCreate || touched) {
    if (!data.authorUserId && !data.authorName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either select an existing author or provide an author name",
        path: ["authorUserId"],
      });
    }
  }
}

export const articleBaseSchema = z.object({
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
  authorUserId: z.string().uuid().optional(),
  authorName: z.string().nullish(),
  authorPosition: z.string().nullish(),
  authorOrganization: z.string().nullish(),
});

export const createArticleSchema = articleBaseSchema.superRefine((data, ctx) => {
  futureDate(data.scheduledAt, ctx);
  validateAuthor(data, ctx, true);
});

export const updateArticleSchema = articleBaseSchema.partial().superRefine((data, ctx) => {
  futureDate(data.scheduledAt, ctx);
  validateAuthor(data, ctx, false);
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

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.number().int().positive().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parentId: z.number().int().positive().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});
