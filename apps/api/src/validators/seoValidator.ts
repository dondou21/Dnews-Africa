import { z } from "zod";

export const seoMetadataSchema = z.object({
  metaTitle: z.string().max(70, "SEO title must be 70 characters or less").optional().nullable(),
  metaDescription: z.string().max(160, "Meta description must be 160 characters or less").optional().nullable(),
  canonicalUrl: z.string().url("Invalid canonical URL").optional().nullable(),
  focusKeyword: z.string().max(100).optional().nullable(),
  robots: z.string().optional().nullable(),
  ogTitle: z.string().max(70).optional().nullable(),
  ogDescription: z.string().max(200).optional().nullable(),
  ogImageId: z.string().uuid().optional().nullable(),
  twitterTitle: z.string().max(70).optional().nullable(),
  twitterDescription: z.string().max(200).optional().nullable(),
  twitterImageId: z.string().uuid().optional().nullable(),
  schemaType: z.enum(["NewsArticle", "Article", "BreadcrumbList", "Organization", "Person", "WebSite", "FAQPage"]).optional().nullable(),
});

export const redirectSchema = z.object({
  fromPath: z.string().min(1, "From path is required").max(500),
  toPath: z.string().min(1, "To path is required").max(500),
  statusCode: z.enum(["301", "302"]).transform(Number).default("301"),
  note: z.string().optional().nullable(),
});

export const updateRedirectSchema = redirectSchema.partial().omit({ fromPath: true });

export const seoSettingsSchema = z.object({
  siteTitle: z.string().optional(),
  defaultDescription: z.string().optional(),
  defaultImageUrl: z.string().url().optional().nullable(),
  defaultRobots: z.string().optional(),
  organizationName: z.string().optional(),
  organizationLogo: z.string().url().optional().nullable(),
  socialFacebook: z.string().optional().nullable(),
  socialTwitter: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialLinkedin: z.string().optional().nullable(),
  googleNewsPubName: z.string().optional().nullable(),
  googleNewsPubLogo: z.string().url().optional().nullable(),
});
