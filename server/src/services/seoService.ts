import { seoRepository } from "../repositories/seoRepository";
import { AppError } from "../middlewares/errorHandler";

export const seoService = {
  async getSeo(entityType: string, entityId: string) {
    return seoRepository.getSeo(entityType, entityId);
  },

  async saveSeo(entityType: string, entityId: string, data: Record<string, unknown>) {
    return seoRepository.upsertSeo(entityType, entityId, data);
  },

  async deleteSeo(entityType: string, entityId: string) {
    return seoRepository.deleteSeo(entityType, entityId);
  },

  async getRedirects(page: number, limit: number, search?: string) {
    return seoRepository.getRedirects({ page, limit, search });
  },

  async createRedirect(data: { fromPath: string; toPath: string; statusCode: number; note?: string }) {
    const fromPath = data.fromPath.startsWith("/") ? data.fromPath : `/${data.fromPath}`;
    const existing = await seoRepository.getRedirectByFromPath(fromPath);
    if (existing) throw new AppError("A redirect with this source path already exists", 400);
    return seoRepository.createRedirect({ ...data, fromPath });
  },

  async updateRedirect(id: string, data: Record<string, unknown>) {
    return seoRepository.updateRedirect(id, data);
  },

  async deleteRedirect(id: string) {
    return seoRepository.deleteRedirect(id);
  },

  async getSettings() {
    return seoRepository.getSeoSettings();
  },

  async updateSettings(data: Record<string, unknown>) {
    return seoRepository.updateSeoSettings(data);
  },

  async getReport() {
    return seoRepository.getSeoReport();
  },

  analyzeSeo(data: {
    title?: string;
    content?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    coverImageUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    twitterTitle?: string | null;
  }) {
    let score = 100;
    const details: Record<string, { score: number; max: number; message: string }> = {};
    const suggestions: string[] = [];

    const title = data.metaTitle || data.title || "";
    const titleLen = title.length;
    if (titleLen === 0) {
      details.title = { score: 0, max: 10, message: "Missing SEO title" };
      score -= 10; suggestions.push("Add an SEO title.");
    } else if (titleLen < 20) {
      details.title = { score: 4, max: 10, message: "SEO title too short (min 20 chars)" };
      score -= 6; suggestions.push("SEO title should be at least 20 characters.");
    } else if (titleLen > 70) {
      details.title = { score: 6, max: 10, message: "SEO title exceeds 70 characters" };
      score -= 4; suggestions.push("SEO title should be 70 characters or fewer.");
    } else {
      details.title = { score: 10, max: 10, message: "Good title length" };
    }

    const desc = data.metaDescription || "";
    const descLen = desc.length;
    if (!desc) {
      details.description = { score: 0, max: 15, message: "Missing meta description" };
      score -= 15; suggestions.push("Add a meta description.");
    } else if (descLen < 50) {
      details.description = { score: 5, max: 15, message: "Meta description too short (min 50 chars)" };
      score -= 10; suggestions.push("Meta description should be at least 50 characters.");
    } else if (descLen > 160) {
      details.description = { score: 10, max: 15, message: "Meta description exceeds 160 characters" };
      score -= 5; suggestions.push("Meta description should be 160 characters or fewer.");
    } else {
      details.description = { score: 15, max: 15, message: "Good description length" };
    }

    const keyword = data.focusKeyword || "";
    if (!keyword) {
      details.keyword = { score: 0, max: 10, message: "No focus keyword" };
      score -= 10; suggestions.push("Set a focus keyword.");
    } else {
      const titleLower = title.toLowerCase();
      const descLower = desc.toLowerCase();
      const kwLower = keyword.toLowerCase();
      let kwScore = 5;
      if (titleLower.includes(kwLower)) kwScore += 3;
      if (descLower.includes(kwLower)) kwScore += 2;
      details.keyword = { score: kwScore, max: 10, message: "Keyword usage" };
      if (kwScore < 8) suggestions.push("Include focus keyword in title or description.");
    }

    if (!data.coverImageUrl) {
      details.image = { score: 0, max: 10, message: "No featured image" };
      score -= 10; suggestions.push("Add a featured image.");
    } else {
      details.image = { score: 10, max: 10, message: "Featured image set" };
    }

    let socialScore = 0;
    if (data.ogTitle) socialScore += 5;
    if (data.ogDescription) socialScore += 5;
    if (data.twitterTitle) socialScore += 3;
    details.social = { score: socialScore, max: 13, message: "Social media metadata" };
    score -= (13 - socialScore);
    if (socialScore < 13) suggestions.push("Add Open Graph and Twitter Card metadata.");

    const content = data.content || "";
    const contentLen = content.length;
    if (contentLen < 300) {
      details.content = { score: 2, max: 12, message: "Content too short (min 300 chars)" };
      score -= 10; suggestions.push("Article content should be at least 300 characters.");
    } else if (contentLen < 1000) {
      details.content = { score: 6, max: 12, message: "Content could be longer" };
      score -= 6;
    } else {
      details.content = { score: 12, max: 12, message: "Good content length" };
    }

    const readabilityScore = Math.min(10, Math.round((contentLen / 500) * 5) + 5);
    details.readability = { score: Math.min(10, readabilityScore), max: 10, message: "Content readability" };

    const slug = (data as any).slug || "";
    if (slug) {
      const slugWords = slug.split("-").length;
      if (slugWords < 2) {
        details.slug = { score: 3, max: 5, message: "Slug too short" };
        score -= 2;
      } else if (slugWords > 8) {
        details.slug = { score: 3, max: 5, message: "Slug too long" };
        score -= 2;
      } else {
        details.slug = { score: 5, max: 5, message: "Good slug" };
      }
    }

    return {
      score: Math.max(0, score),
      details,
      suggestions,
      grade: score >= 80 ? "excellent" : score >= 50 ? "needs_improvement" : "poor",
    };
  },
};
