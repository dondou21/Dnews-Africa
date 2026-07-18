import prisma from "../utils/prisma";

function getPeriodRange(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = now;
  let startDate: Date;
  switch (period) {
    case "24h": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
    case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    case "90d": startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
    case "1y": startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
    default: startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return { startDate, endDate };
}

export const analyticsRepository = {
  async getDashboard(period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const whereViews = { createdAt: { gte: range.startDate, lte: range.endDate } };
    const whereSessions = { createdAt: { gte: range.startDate, lte: range.endDate } };

    const [totalViews, totalSessions, uniqueVisitorsCount, activeReaders, avgDuration, bouncedCount, returningCount] = await Promise.all([
      prisma.pageView.count({ where: whereViews }),
      prisma.visitorSession.count({ where: whereSessions }),
      prisma.$queryRawUnsafe<Array<{ cnt: bigint }>>(`SELECT COUNT(DISTINCT visitor_id) as cnt FROM page_views WHERE created_at >= $1 AND created_at <= $2`, range.startDate, range.endDate),
      prisma.visitorSession.count({ where: { endTime: { gte: new Date(Date.now() - 5 * 60 * 1000) } } }),
      prisma.visitorSession.aggregate({ where: { duration: { not: null }, ...whereSessions }, _avg: { duration: true } }),
      prisma.visitorSession.count({ where: { isBounced: true, ...whereSessions } }),
      prisma.visitorSession.count({ where: { isReturning: true, ...whereSessions } }),
    ]);

    const uniqueVisitors = Number(uniqueVisitorsCount[0]?.cnt ?? 0);
    const avgSessionDuration = avgDuration._avg?.duration ?? 0;
    const bounceRate = totalSessions > 0 ? (bouncedCount / totalSessions) * 100 : 0;
    const pagesPerSession = totalSessions > 0 ? totalViews / totalSessions : 0;

    return {
      totalPageViews: totalViews,
      uniqueVisitors,
      totalSessions,
      activeReaders,
      avgSessionDuration: Math.round(avgSessionDuration * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      pagesPerSession: Math.round(pagesPerSession * 100) / 100,
      returningVisitors: returningCount,
      periodStart: range.startDate,
      periodEnd: range.endDate,
    };
  },

  async getTrafficSources(period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const raw = await prisma.$queryRawUnsafe<Array<{ traffic_source: string; views: bigint; unique_visitors: bigint }>>(
      `SELECT traffic_source, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_visitors FROM page_views WHERE created_at >= $1 AND created_at <= $2 GROUP BY traffic_source ORDER BY views DESC`,
      range.startDate, range.endDate
    );

    const total = raw.reduce((sum, r) => sum + Number(r.views), 0);
    return raw.map((r) => ({
      source: r.traffic_source,
      views: Number(r.views),
      uniqueVisitors: Number(r.unique_visitors),
      percentage: total > 0 ? Math.round((Number(r.views) / total) * 10000) / 100 : 0,
    }));
  },

  async getTopArticles(period: string, limit = 10, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const raw = await prisma.$queryRawUnsafe<Array<{
      article_id: string; title: string; views: bigint;
      unique_readers: bigint; avg_time: number | null; avg_scroll: number | null; avg_completion: number | null;
    }>>(
      `SELECT article_id, title, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_readers,
        AVG(time_on_page) as avg_time, AVG(scroll_depth) as avg_scroll, AVG(completion_rate) as avg_completion
       FROM article_views WHERE created_at >= $1 AND created_at <= $2
       GROUP BY article_id, title ORDER BY views DESC LIMIT $3`,
      range.startDate, range.endDate, limit
    );

    return raw.map((a) => ({
      articleId: a.article_id,
      title: a.title,
      views: Number(a.views),
      uniqueReaders: Number(a.unique_readers),
      avgTimeOnPage: a.avg_time ? Math.round(a.avg_time * 100) / 100 : 0,
      avgScrollDepth: a.avg_scroll ? Math.round(a.avg_scroll * 100) / 100 : 0,
      avgCompletionRate: a.avg_completion ? Math.round(a.avg_completion * 100) / 100 : 0,
    }));
  },

  async getArticleAnalytics(articleId: string, period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const raw = await prisma.$queryRawUnsafe<Array<{
      views: bigint; unique_readers: bigint; avg_time: number | null; avg_scroll: number | null; avg_completion: number | null;
    }>>(
      `SELECT COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_readers,
        AVG(time_on_page) as avg_time, AVG(scroll_depth) as avg_scroll, AVG(completion_rate) as avg_completion
       FROM article_views WHERE article_id = $1 AND created_at >= $2 AND created_at <= $3`,
      articleId, range.startDate, range.endDate
    );

    const trafficRaw = await prisma.$queryRawUnsafe<Array<{ traffic_source: string; views: bigint }>>(
      `SELECT traffic_source, COUNT(*) as views FROM article_views WHERE article_id = $1 AND created_at >= $2 AND created_at <= $3 GROUP BY traffic_source`,
      articleId, range.startDate, range.endDate
    );

    const dailyRaw = await prisma.$queryRawUnsafe<Array<{ date: Date; views: bigint }>>(
      `SELECT DATE(created_at) as date, COUNT(*)::int as views FROM article_views WHERE article_id = $1 AND created_at >= $2 AND created_at <= $3 GROUP BY DATE(created_at) ORDER BY date`,
      articleId, range.startDate, range.endDate
    );

    const row = raw[0];
    return {
      articleId,
      totalViews: Number(row?.views ?? 0),
      uniqueReaders: Number(row?.unique_readers ?? 0),
      avgTimeOnPage: row?.avg_time ? Math.round(row.avg_time * 100) / 100 : 0,
      avgScrollDepth: row?.avg_scroll ? Math.round(row.avg_scroll * 100) / 100 : 0,
      avgCompletionRate: row?.avg_completion ? Math.round(row.avg_completion * 100) / 100 : 0,
      trafficSources: trafficRaw.map((t) => ({ source: t.traffic_source, views: Number(t.views) })),
      dailyViews: dailyRaw.map((d) => ({ date: d.date, views: Number(d.views) })),
    };
  },

  async getAuthorAnalytics(authorId: string, period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const articles = await prisma.article.findMany({
      where: { authorId },
      select: { id: true, title: true, slug: true, publishedAt: true, status: true, category: { select: { name: true } } },
    });
    const articleIds = articles.map((a) => a.id);

    if (articleIds.length === 0) {
      return { authorId, totalArticles: 0, totalViews: 0, uniqueReaders: 0, avgViews: 0, avgReadingTime: 0, avgScrollDepth: 0, avgCompletionRate: 0, topArticles: [] };
    }

    const raw = await prisma.$queryRawUnsafe<Array<{
      views: bigint; avg_time: number | null; avg_scroll: number | null; avg_completion: number | null;
    }>>(
      `SELECT COUNT(*) as views, AVG(time_on_page) as avg_time, AVG(scroll_depth) as avg_scroll, AVG(completion_rate) as avg_completion
       FROM article_views WHERE article_id = ANY($1::text[]) AND created_at >= $2 AND created_at <= $3`,
      articleIds, range.startDate, range.endDate
    );

    const topRaw = await prisma.$queryRawUnsafe<Array<{ article_id: string; title: string; views: bigint }>>(
      `SELECT article_id, title, COUNT(*) as views FROM article_views
       WHERE article_id = ANY($1::text[]) AND created_at >= $2 AND created_at <= $3
       GROUP BY article_id, title ORDER BY views DESC LIMIT 5`,
      articleIds, range.startDate, range.endDate
    );

    const row = raw[0];
    const publishedArticles = articles.filter((a) => a.status === "PUBLISHED");
    return {
      authorId,
      totalArticles: publishedArticles.length,
      totalViews: Number(row?.views ?? 0),
      avgViews: publishedArticles.length > 0 ? Math.round(Number(row?.views ?? 0) / publishedArticles.length) : 0,
      avgReadingTime: row?.avg_time ? Math.round(row.avg_time * 100) / 100 : 0,
      avgScrollDepth: row?.avg_scroll ? Math.round(row.avg_scroll * 100) / 100 : 0,
      avgCompletionRate: row?.avg_completion ? Math.round(row.avg_completion * 100) / 100 : 0,
      topArticles: topRaw.map((t) => ({ articleId: t.article_id, title: t.title, views: Number(t.views) })),
    };
  },

  async getCategoryAnalytics(categoryId: number, period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const articles = await prisma.article.findMany({
      where: { categoryId },
      select: { id: true, author: { select: { id: true, firstName: true, lastName: true } } },
    });
    const articleIds = articles.map((a) => a.id);

    if (articleIds.length === 0) {
      return { categoryId, totalArticles: 0, totalViews: 0, uniqueReaders: 0, avgTime: 0, topAuthors: [], topStories: [] };
    }

    const raw = await prisma.$queryRawUnsafe<Array<{
      views: bigint; unique_readers: bigint; avg_time: number | null;
    }>>(
      `SELECT COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_readers, AVG(time_on_page) as avg_time
       FROM article_views WHERE article_id = ANY($1::text[]) AND created_at >= $2 AND created_at <= $3`,
      articleIds, range.startDate, range.endDate
    );

    const topStoriesRaw = await prisma.$queryRawUnsafe<Array<{ article_id: string; title: string; views: bigint }>>(
      `SELECT article_id, title, COUNT(*) as views FROM article_views
       WHERE article_id = ANY($1::text[]) AND created_at >= $2 AND created_at <= $3
       GROUP BY article_id, title ORDER BY views DESC LIMIT 5`,
      articleIds, range.startDate, range.endDate
    );

    const authorViewsRaw = await prisma.$queryRawUnsafe<Array<{ article_id: string; views: bigint }>>(
      `SELECT article_id, COUNT(*) as views FROM article_views
       WHERE article_id = ANY($1::text[]) AND created_at >= $2 AND created_at <= $3
       GROUP BY article_id`,
      articleIds, range.startDate, range.endDate
    );

    const authorViewMap = new Map<string, number>();
    for (const stat of authorViewsRaw) {
      const article = articles.find((a) => a.id === stat.article_id);
      if (article) {
        const key = article.author.id;
        authorViewMap.set(key, (authorViewMap.get(key) ?? 0) + Number(stat.views));
      }
    }

    const authorCounts = articles.reduce<Record<string, { id: string; name: string; count: number }>>((acc, a) => {
      const key = a.author.id;
      if (!acc[key]) acc[key] = { id: a.author.id, name: `${a.author.firstName} ${a.author.lastName}`, count: 0 };
      acc[key].count++;
      return acc;
    }, {});

    const topAuthors = Object.values(authorCounts)
      .map((a) => ({ ...a, views: authorViewMap.get(a.id) ?? 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const row = raw[0];
    return {
      categoryId,
      totalArticles: articleIds.length,
      totalViews: Number(row?.views ?? 0),
      uniqueReaders: Number(row?.unique_readers ?? 0),
      avgTime: row?.avg_time ? Math.round(row.avg_time * 100) / 100 : 0,
      topAuthors,
      topStories: topStoriesRaw.map((t) => ({ articleId: t.article_id, title: t.title, views: Number(t.views) })),
    };
  },

  async getSearchAnalytics(period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const [total, noResults, popularRaw, recentRaw, noResultRaw] = await Promise.all([
      prisma.searchQuery.count({ where: { createdAt: { gte: range.startDate, lte: range.endDate } } }),
      prisma.searchQuery.count({ where: { noResults: true, createdAt: { gte: range.startDate, lte: range.endDate } } }),
      prisma.$queryRawUnsafe<Array<{ normalized: string; query: string; cnt: bigint }>>(
        `SELECT normalized, query, COUNT(*) as cnt FROM search_queries WHERE created_at >= $1 AND created_at <= $2 GROUP BY normalized, query ORDER BY cnt DESC LIMIT 20`,
        range.startDate, range.endDate
      ),
      prisma.searchQuery.findMany({
        where: { createdAt: { gte: range.startDate, lte: range.endDate } },
        orderBy: { createdAt: "desc" }, take: 50,
        select: { query: true, resultsCount: true, noResults: true, source: true, createdAt: true },
      }),
      prisma.searchQuery.findMany({
        where: { noResults: true, createdAt: { gte: range.startDate, lte: range.endDate } },
        select: { query: true, createdAt: true },
        orderBy: { createdAt: "desc" }, take: 20,
      }),
    ]);

    return {
      totalSearches: total,
      noResultSearches: noResults,
      noResultRate: total > 0 ? Math.round((noResults / total) * 10000) / 100 : 0,
      popularSearches: popularRaw.map((p) => ({ query: p.query, count: Number(p.cnt) })),
      recentSearches: recentRaw,
      noResultQueries: noResultRaw.map((q) => ({ query: q.query, createdAt: q.createdAt })),
    };
  },

  async getRealtime() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [activeReaders, todayViews, todayVisitorsRaw, activePagesRaw] = await Promise.all([
      prisma.visitorSession.count({ where: { endTime: { gte: fiveMinAgo } } }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.$queryRawUnsafe<Array<{ cnt: bigint }>>(`SELECT COUNT(DISTINCT visitor_id) as cnt FROM page_views WHERE created_at >= $1`, todayStart),
      prisma.$queryRawUnsafe<Array<{ path: string; title: string | null; cnt: bigint }>>(
        `SELECT path, title, COUNT(*) as cnt FROM page_views WHERE created_at >= $1 GROUP BY path, title ORDER BY cnt DESC LIMIT 10`,
        fiveMinAgo
      ),
    ]);

    return {
      activeReaders,
      todayPageViews: todayViews,
      todayVisitors: Number(todayVisitorsRaw[0]?.cnt ?? 0),
      activePages: activePagesRaw.map((p) => ({ path: p.path, title: p.title, activeUsers: Number(p.cnt) })),
    };
  },

  async getHomepageAnalytics(period: string, startDate?: string, endDate?: string) {
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getPeriodRange(period);

    const [homepageViews, sectionClicks, heroClicks, sectionClicksRaw] = await Promise.all([
      prisma.pageView.count({ where: { entityType: "homepage", createdAt: { gte: range.startDate, lte: range.endDate } } }),
      prisma.readerEvent.count({ where: { eventType: "section_click", createdAt: { gte: range.startDate, lte: range.endDate } } }),
      prisma.readerEvent.count({ where: { eventType: "hero_click", createdAt: { gte: range.startDate, lte: range.endDate } } }),
      prisma.$queryRawUnsafe<Array<{ entity_type: string | null; cnt: bigint }>>(
        `SELECT entity_type, COUNT(*) as cnt FROM reader_events WHERE event_type = 'section_click' AND created_at >= $1 AND created_at <= $2 GROUP BY entity_type ORDER BY cnt DESC`,
        range.startDate, range.endDate
      ),
    ]);

    return {
      homepageViews,
      sectionClicks,
      heroClicks,
      sectionClicksByType: sectionClicksRaw.map((s) => ({ type: s.entity_type, clicks: Number(s.cnt) })),
    };
  },

  async getTrendingArticles(limit = 10) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const raw = await prisma.$queryRawUnsafe<Array<{
      article_id: string; title: string; views: bigint; unique_readers: bigint;
    }>>(
      `SELECT article_id, title, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_readers
       FROM article_views WHERE created_at >= $1
       GROUP BY article_id, title ORDER BY views DESC LIMIT $2`,
      oneHourAgo, limit
    );
    return raw.map((v) => ({
      articleId: v.article_id,
      title: v.title,
      viewsLastHour: Number(v.views),
      uniqueReaders: Number(v.unique_readers),
    }));
  },
};
