import { z } from "zod";

const SESSION_TYPES = [
  "hero_slider", "breaking_news", "top_stories", "featured_story", "trending_news",
  "latest_news", "category_block", "editors_picks", "most_read", "most_commented",
  "opinion", "business", "sports", "innovation", "culture", "travel", "lifestyle",
  "video_section", "photo_gallery", "newsletter_block", "advertisement_block",
  "sponsor_block", "weather_widget", "social_feed", "custom_html",
] as const;

export const sectionSchema = z.object({
  type: z.enum(SESSION_TYPES),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  position: z.number().int().min(0),
  visible: z.boolean().optional().default(true),
  settings: z.object({
    articleCount: z.number().int().min(1).max(50).optional(),
    categoryId: z.number().int().optional(),
    tag: z.string().optional(),
    authorId: z.string().uuid().optional(),
    sortOrder: z.enum(["latest", "oldest", "trending", "popular", "random"]).optional(),
    filter: z.string().optional(),
    source: z.enum(["latest", "trending", "most_read", "most_commented", "editors_picks", "manual", "category", "tag", "author", "scheduled"]).optional(),
    manualArticleIds: z.array(z.string().uuid()).optional(),
    adPlacement: z.string().optional(),
    adCampaignId: z.string().uuid().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    padding: z.string().optional(),
    theme: z.enum(["light", "dark", "custom"]).optional(),
    customHtml: z.string().optional(),
    autoPlay: z.boolean().optional(),
    slideInterval: z.number().int().optional(),
    showTitle: z.boolean().optional(),
    showExcerpt: z.boolean().optional(),
    imageSize: z.enum(["small", "medium", "large", "full"]).optional(),
    layout: z.enum(["grid", "list", "carousel", "masonry", "compact"]).optional(),
  }).optional().nullable(),
});

export const createLayoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  isDefault: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  settings: z.object({
    heroSlides: z.number().int().optional(),
    breakingNewsSpeed: z.number().int().optional(),
    featuredCategories: z.array(z.number().int()).optional(),
    sidebarWidgets: z.array(z.string()).optional(),
    adPositions: z.array(z.string()).optional(),
    stickySections: z.array(z.string()).optional(),
  }).optional().nullable(),
  sections: z.array(sectionSchema).optional(),
});

export const updateLayoutSchema = createLayoutSchema.partial().omit({ slug: true });

export const duplicateLayoutSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});
