import { z } from "zod";

const adTypes = ["BANNER", "LEADERBOARD", "SIDEBAR", "SQUARE", "RECTANGLE", "MOBILE_BANNER", "POPUP", "INTERSTITIAL", "SPONSORED_ARTICLE", "VIDEO", "NATIVE"] as const;
const adPlacements = ["HOMEPAGE_HERO", "HOMEPAGE_SIDEBAR", "HOMEPAGE_BETWEEN", "CATEGORY_PAGES", "ARTICLE_TOP", "ARTICLE_MIDDLE", "ARTICLE_BOTTOM", "FOOTER", "HEADER", "NEWSLETTER", "SEARCH_RESULTS", "MOBILE_FEED"] as const;
const rotations = ["RANDOM", "PRIORITY", "WEIGHTED", "SEQUENTIAL"] as const;

export const createAdSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(adTypes),
  placement: z.enum(adPlacements),
  targetUrl: z.string().url("Must be a valid URL"),
  advertiserId: z.string().uuid("Invalid advertiser"),
  campaignId: z.string().uuid().optional(),
  imageId: z.string().uuid().optional(),
  videoId: z.string().uuid().optional(),
  buttonText: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.number().int().min(0).optional(),
  maxImpressions: z.number().int().positive().optional(),
  maxClicks: z.number().int().positive().optional(),
  rotation: z.enum(rotations).optional(),
  weight: z.number().int().min(1).optional(),
});

export const updateAdSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(adTypes).optional(),
  placement: z.enum(adPlacements).optional(),
  targetUrl: z.string().url().optional(),
  advertiserId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional().nullable(),
  imageId: z.string().uuid().optional().nullable(),
  videoId: z.string().uuid().optional().nullable(),
  buttonText: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  priority: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"]).optional(),
  maxImpressions: z.number().int().positive().optional().nullable(),
  maxClicks: z.number().int().positive().optional().nullable(),
  rotation: z.enum(rotations).optional(),
  weight: z.number().int().min(1).optional(),
});
