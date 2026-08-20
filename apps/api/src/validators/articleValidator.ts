import { z } from "zod";
import { contentIsEmpty } from "@dnews/types";

const futureDate = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return;
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date format" });
    return;
  }
  const now = new Date();
  now.setSeconds(0, 0);
  if (date <= now) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Scheduled time must be in the future. Select a time at least 1 minute ahead." });
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
  featuredImageCaption: z.string().optional(),
  featuredImageCredit: z.string().optional(),
  featuredImageSource: z.string().optional(),
  featuredImageDescription: z.string().optional(),
  featuredImageCopyright: z.string().optional(),
  featuredImageLocation: z.string().optional(),
  featuredImageDateTaken: z.string().optional(),
  categoryId: z.number().int().positive("Category is required"),
  status: z.enum(["IDEA", "DRAFT", "IN_REVIEW", "NEEDS_REVISION", "APPROVED", "SCHEDULED", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  sendNewsletter: z.boolean().optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  authorUserId: z.string().uuid().optional(),
  authorName: z.string().nullish(),
  authorPosition: z.string().nullish(),
  authorOrganization: z.string().nullish(),
});

function validateAuthor(
  data: { authorUserId?: string; authorName?: string | null },
  ctx: z.RefinementCtx,
) {
  const touched = data.authorUserId !== undefined || data.authorName !== undefined;
  if (touched && !data.authorUserId && !data.authorName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either select an existing author or provide an author name",
      path: ["authorUserId"],
    });
  }
}

function validateRequiredContent(data: Record<string, unknown>, ctx: z.RefinementCtx) {
  const requiredKeys = ["title", "slug", "summary", "content", "categoryId"] as const;
  for (const key of requiredKeys) {
    const val = data[key];
    if (
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim().length === 0) ||
      (typeof val === "number" && !(val > 0)) ||
      (key === "content" && typeof val === "string" && contentIsEmpty(val))
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${key} is required`, path: [key] });
    }
  }
}

export const createArticleSchema = articleBaseSchema.superRefine((data, ctx) => {
  futureDate(data.scheduledAt, ctx);
  validateAuthor(data, ctx);
  validateRequiredContent({ ...data }, ctx);
});

export const updateArticleSchema = z
  .object({
    ...articleBaseSchema.shape,
    title: articleBaseSchema.shape.title.optional().refine((v) => v === undefined || v.trim().length > 0, "Title cannot be blank"),
    slug: articleBaseSchema.shape.slug.optional().refine((v) => v === undefined || v.trim().length > 0, "Slug cannot be blank"),
    summary: articleBaseSchema.shape.summary.optional().refine((v) => v === undefined || v.trim().length > 0, "Summary cannot be blank"),
    content: articleBaseSchema.shape.content.optional().refine((v) => v === undefined || !contentIsEmpty(v), "Content is required"),
    categoryId: articleBaseSchema.shape.categoryId.optional(),
  })
  .superRefine((data, ctx) => {
    futureDate(data.scheduledAt, ctx);
    validateAuthor(data, ctx);
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
