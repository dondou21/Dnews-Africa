import { z } from "zod";

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(["24h", "7d", "30d", "90d", "1y", "custom"]).optional().default("7d"),
});

export const dashboardQuerySchema = dateRangeSchema.extend({});

export const analyticsQuerySchema = dateRangeSchema.extend({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default("views"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  categoryId: z.coerce.number().int().optional(),
  authorId: z.string().uuid().optional(),
  trafficSource: z.string().optional(),
  deviceType: z.string().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
});

export const trackingEventSchema = z.object({
  eventType: z.string(),
  eventData: z.record(z.unknown()).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  value: z.number().optional(),
  pageViewId: z.string().optional(),
});

export const pageViewSchema = z.object({
  path: z.string(),
  title: z.string().optional(),
  referrer: z.string().optional(),
  referrerUrl: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  timeOnPage: z.number().int().optional(),
  scrollDepth: z.number().int().optional(),
  sessionId: z.string().optional(),
});

export const sessionSchema = z.object({
  sessionId: z.string().optional(),
  anonymousId: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  deviceType: z.enum(["DESKTOP", "TABLET", "MOBILE", "UNKNOWN"]).optional(),
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  deviceModel: z.string().optional(),
  screenWidth: z.number().int().optional(),
  screenHeight: z.number().int().optional(),
  referrer: z.string().optional(),
  referrerUrl: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1),
  resultsCount: z.number().int().optional(),
  source: z.string().optional(),
  sessionId: z.string().optional(),
});

export const exportSchema = z.object({
  exportType: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
  format: z.enum(["csv", "xlsx", "pdf"]),
  periodStart: z.string(),
  periodEnd: z.string(),
  filters: z.record(z.unknown()).optional(),
});
