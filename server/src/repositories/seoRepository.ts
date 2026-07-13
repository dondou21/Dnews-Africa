import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const seoRepository = {
  async getSeo(entityType: string, entityId: string) {
    return prisma.seoMetadata.findUnique({
      where: { entityType_entityId: { entityType, entityId } },
    });
  },

  async upsertSeo(entityType: string, entityId: string, data: Record<string, unknown>) {
    return prisma.seoMetadata.upsert({
      where: { entityType_entityId: { entityType, entityId } },
      create: { entityType, entityId, ...data } as Prisma.SeoMetadataCreateInput,
      update: data as Prisma.SeoMetadataUpdateInput,
    });
  },

  async deleteSeo(entityType: string, entityId: string) {
    return prisma.seoMetadata.delete({
      where: { entityType_entityId: { entityType, entityId } },
    }).catch(() => null);
  },

  async getRedirects(params: { page: number; limit: number; search?: string; active?: boolean }) {
    const where: Prisma.RedirectWhereInput = {};
    if (params.search) {
      where.OR = [
        { fromPath: { contains: params.search, mode: "insensitive" } },
        { toPath: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.active !== undefined) where.active = params.active;

    const skip = (params.page - 1) * params.limit;
    const [redirects, total] = await Promise.all([
      prisma.redirect.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: params.limit }),
      prisma.redirect.count({ where }),
    ]);

    return { redirects, pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) } };
  },

  async createRedirect(data: { fromPath: string; toPath: string; statusCode: number; note?: string }) {
    return prisma.redirect.create({ data });
  },

  async updateRedirect(id: string, data: Record<string, unknown>) {
    return prisma.redirect.update({ where: { id }, data: data as Prisma.RedirectUpdateInput });
  },

  async deleteRedirect(id: string) {
    return prisma.redirect.delete({ where: { id } });
  },

  async getRedirectByFromPath(fromPath: string) {
    return prisma.redirect.findUnique({ where: { fromPath, active: true } });
  },

  async getSeoSettings() {
    const settings = await prisma.seoSettings.findFirst({ orderBy: { id: "asc" } });
    if (!settings) {
      return prisma.seoSettings.create({ data: {} });
    }
    return settings;
  },

  async updateSeoSettings(data: Record<string, unknown>) {
    const settings = await prisma.seoSettings.findFirst({ orderBy: { id: "asc" } });
    if (!settings) {
      return prisma.seoSettings.create({ data: data as Prisma.SeoSettingsCreateInput });
    }
    return prisma.seoSettings.update({ where: { id: settings.id }, data: data as Prisma.SeoSettingsUpdateInput });
  },

  async getSeoReport() {
    const totalArticles = await prisma.article.count();
    const withMetaDesc = await prisma.seoMetadata.count({
      where: { entityType: "article", metaDescription: { not: null } },
    });
    const withFeaturedImage = await prisma.article.count({
      where: { coverImageUrl: { not: null } },
    });
    const missingMetaDesc = totalArticles - withMetaDesc;
    const missingFeaturedImage = totalArticles - withFeaturedImage;

    const articles = await prisma.article.findMany({
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const seoData = await prisma.seoMetadata.findMany({
      where: { entityType: "article" },
    });

    const seoMap = new Map(seoData.map((s) => [s.entityId, s]));

    const scored = articles.map((a) => {
      const s = seoMap.get(a.id);
      const score = analyzeArticleSeo(a, s);
      return { articleId: a.id, title: a.title, slug: a.slug, status: a.status, ...score };
    });

    const excellent = scored.filter((s) => s.score >= 80).length;
    const needsImprovement = scored.filter((s) => s.score >= 50 && s.score < 80).length;
    const poor = scored.filter((s) => s.score < 50).length;

    return {
      stats: {
        totalArticles,
        missingMetaDesc,
        missingFeaturedImage,
        excellent,
        needsImprovement,
        poor,
        avgScore: scored.length ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length) : 0,
      },
      articles: scored,
    };
  },
};

function analyzeArticleSeo(article: { title: string; content?: string; coverImageUrl?: string | null }, seo: any) {
  let score = 100;
  const suggestions: string[] = [];

  const titleLen = article.title?.length ?? 0;
  if (titleLen < 20) { score -= 10; suggestions.push("Title is too short (min 20 characters)."); }
  if (titleLen > 70) { score -= 5; suggestions.push("Title exceeds 70 characters."); }
  if (titleLen > 0) { score += 5; }

  const metaDescLen = seo?.metaDescription?.length ?? 0;
  if (!seo?.metaDescription) { score -= 15; suggestions.push("Missing meta description."); }
  else if (metaDescLen < 50) { score -= 5; suggestions.push("Meta description is too short (min 50 characters)."); }
  else if (metaDescLen > 160) { score -= 5; suggestions.push("Meta description exceeds 160 characters."); }

  if (!seo?.metaTitle && !article.title) { score -= 10; suggestions.push("Missing SEO title."); }

  if (!seo?.focusKeyword) { score -= 5; suggestions.push("No focus keyword set."); }
  else {
    const kw = seo.focusKeyword.toLowerCase();
    const titleLower = article.title?.toLowerCase() ?? "";
    if (!titleLower.includes(kw)) { score -= 5; suggestions.push("Focus keyword not found in title."); }
  }

  if (!article.coverImageUrl) { score -= 5; suggestions.push("Missing featured image."); }

  if (!seo?.ogTitle) { score -= 3; suggestions.push("Missing Open Graph title."); }
  if (!seo?.ogDescription) { score -= 3; suggestions.push("Missing Open Graph description."); }
  if (!seo?.twitterTitle) { score -= 2; suggestions.push("Missing Twitter Card title."); }

  if (!seo?.canonicalUrl) { score -= 3; suggestions.push("Missing canonical URL."); }

  return {
    score: Math.max(0, score),
    titleScore: titleLen >= 20 && titleLen <= 70 ? 100 : titleLen > 0 ? 50 : 0,
    descriptionScore: metaDescLen >= 50 && metaDescLen <= 160 ? 100 : metaDescLen > 0 ? 50 : 0,
    keywordScore: seo?.focusKeyword ? 100 : 0,
    imageScore: article.coverImageUrl ? 100 : 0,
    socialScore: (seo?.ogTitle ? 50 : 0) + (seo?.ogDescription ? 50 : 0),
    suggestions,
  };
}
