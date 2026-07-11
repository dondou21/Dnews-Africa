import prisma from "../utils/prisma";
import { analyticsRepository } from "../repositories/analyticsRepository";

export const reportsService = {
  async generateReport(exportType: string, periodStart: string, periodEnd: string, filters?: Record<string, unknown>) {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let period: string;
    if (days <= 1) period = "24h";
    else if (days <= 7) period = "7d";
    else if (days <= 30) period = "30d";
    else if (days <= 90) period = "90d";
    else period = "1y";

    const [dashboard, trafficSources, topArticles, searchAnalytics, homepageAnalytics, dailyStats] = await Promise.all([
      analyticsRepository.getDashboard(period, startDate.toISOString(), endDate.toISOString()),
      analyticsRepository.getTrafficSources(period, startDate.toISOString(), endDate.toISOString()),
      analyticsRepository.getTopArticles(period, 20, startDate.toISOString(), endDate.toISOString()),
      analyticsRepository.getSearchAnalytics(period, startDate.toISOString(), endDate.toISOString()),
      analyticsRepository.getHomepageAnalytics(period, startDate.toISOString(), endDate.toISOString()),
      prisma.dailyStat.findMany({
        where: { entityType: null, entityId: null, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      }),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      period: { start: startDate.toISOString(), end: endDate.toISOString(), type: exportType },
      summary: {
        totalPageViews: dashboard.totalPageViews,
        uniqueVisitors: dashboard.uniqueVisitors,
        totalSessions: dashboard.totalSessions,
        avgSessionDuration: dashboard.avgSessionDuration,
        bounceRate: dashboard.bounceRate,
        pagesPerSession: dashboard.pagesPerSession,
      },
      trafficSources,
      topArticles,
      searchAnalytics: {
        totalSearches: searchAnalytics.totalSearches,
        noResultRate: searchAnalytics.noResultRate,
        popularSearches: searchAnalytics.popularSearches.slice(0, 10),
      },
      homepageAnalytics,
      dailyTrend: dailyStats.map((d) => ({
        date: d.date.toISOString().split("T")[0],
        pageViews: d.pageViews,
        uniqueVisitors: d.uniqueVisitors,
        sessions: d.sessions,
      })),
      filters: filters ?? {},
    };

    return report;
  },

  async requestExport(data: {
    exportType: string; format: string; periodStart: string; periodEnd: string;
    filters?: Record<string, unknown>; userId: string;
  }) {
    const exportRecord = await prisma.analyticsExport.create({
      data: {
        exportType: data.exportType, format: data.format,
        periodStart: new Date(data.periodStart), periodEnd: new Date(data.periodEnd),
        filters: (data.filters ?? {}) as any, status: "processing", createdById: data.userId,
      },
    });

    // In production, this would spawn a background job to generate CSV/XLSX/PDF
    // For now, we mark it as completed with a placeholder
    const report = await this.generateReport(data.exportType, data.periodStart, data.periodEnd, data.filters);

    await prisma.analyticsExport.update({
      where: { id: exportRecord.id },
      data: { status: "completed" },
    });

    return { id: exportRecord.id, status: "completed", report };
  },

  async getExports(userId: string) {
    return prisma.analyticsExport.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },
};
