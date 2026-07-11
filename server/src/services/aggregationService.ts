import prisma from "../utils/prisma";

export const aggregationService = {
  async aggregateDaily() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);

    const [pageViews, visitorsRaw, sessions, avgTime, bouncedCount, scrollData, trafficSources, articleViews] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: yesterday, lte: endOfDay } } }),
      prisma.$queryRawUnsafe<Array<{ cnt: bigint }>>(`SELECT COUNT(DISTINCT visitor_id) as cnt FROM page_views WHERE created_at >= $1 AND created_at <= $2`, yesterday, endOfDay),
      prisma.visitorSession.count({ where: { createdAt: { gte: yesterday, lte: endOfDay } } }),
      prisma.pageView.aggregate({ where: { createdAt: { gte: yesterday, lte: endOfDay }, timeOnPage: { not: null } }, _avg: { timeOnPage: true } }),
      prisma.visitorSession.count({ where: { isBounced: true, createdAt: { gte: yesterday, lte: endOfDay } } }),
      prisma.pageView.aggregate({ where: { createdAt: { gte: yesterday, lte: endOfDay }, scrollDepth: { not: null } }, _avg: { scrollDepth: true } }),
      prisma.$queryRawUnsafe<Array<{ traffic_source: string; cnt: bigint }>>(
        `SELECT traffic_source, COUNT(*) as cnt FROM page_views WHERE created_at >= $1 AND created_at <= $2 GROUP BY traffic_source`,
        yesterday, endOfDay
      ),
      prisma.$queryRawUnsafe<Array<{ article_id: string; views: bigint; unique_visitors: bigint; avg_time: number | null; avg_scroll: number | null }>>(
        `SELECT article_id, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_visitors,
          AVG(time_on_page) as avg_time, AVG(scroll_depth) as avg_scroll
         FROM article_views WHERE created_at >= $1 AND created_at <= $2
         GROUP BY article_id`,
        yesterday, endOfDay
      ),
    ]);

    const uniqueVisitors = Number((visitorsRaw[0] as any)?.cnt ?? 0);
    const bounceRate = sessions > 0 ? bouncedCount / sessions : 0;

    await prisma.dailyStat.upsert({
      where: { date_entityType_entityId: { date: yesterday, entityType: "global", entityId: "all" } },
      create: {
        date: yesterday, entityType: "global", entityId: "all",
        pageViews, uniqueVisitors, sessions,
        avgTimeOnPage: avgTime._avg.timeOnPage,
        bounceRate,
        avgScrollDepth: scrollData._avg.scrollDepth,
        directViews: Number(trafficSources.find((t) => t.traffic_source === "DIRECT")?.cnt ?? 0),
        googleSearch: Number(trafficSources.find((t) => t.traffic_source === "GOOGLE_SEARCH")?.cnt ?? 0),
        googleDiscover: Number(trafficSources.find((t) => t.traffic_source === "GOOGLE_DISCOVER")?.cnt ?? 0),
        googleNews: Number(trafficSources.find((t) => t.traffic_source === "GOOGLE_NEWS")?.cnt ?? 0),
        socialViews: Number(trafficSources.filter((t) => ["FACEBOOK", "TWITTER", "LINKEDIN", "WHATSAPP"].includes(t.traffic_source)).reduce((s, t) => s + Number(t.cnt), 0)),
        newsletterViews: Number(trafficSources.find((t) => t.traffic_source === "NEWSLETTER")?.cnt ?? 0),
        referralViews: Number(trafficSources.find((t) => t.traffic_source === "REFERRAL")?.cnt ?? 0),
      },
      update: {
        pageViews, uniqueVisitors, sessions,
        avgTimeOnPage: avgTime._avg.timeOnPage,
        bounceRate,
        avgScrollDepth: scrollData._avg.scrollDepth,
        directViews: Number(trafficSources.find((t) => t.traffic_source === "DIRECT")?.cnt ?? 0),
        googleSearch: Number(trafficSources.find((t) => t.traffic_source === "GOOGLE_SEARCH")?.cnt ?? 0),
        googleDiscover: Number(trafficSources.find((t) => t.traffic_source === "GOOGLE_DISCOVER")?.cnt ?? 0),
        googleNews: Number(trafficSources.find((t) => t.traffic_source === "GOOGLE_NEWS")?.cnt ?? 0),
        socialViews: Number(trafficSources.filter((t) => ["FACEBOOK", "TWITTER", "LINKEDIN", "WHATSAPP"].includes(t.traffic_source)).reduce((s, t) => s + Number(t.cnt), 0)),
        newsletterViews: Number(trafficSources.find((t) => t.traffic_source === "NEWSLETTER")?.cnt ?? 0),
        referralViews: Number(trafficSources.find((t) => t.traffic_source === "REFERRAL")?.cnt ?? 0),
      },
    });

    for (const av of articleViews) {
      await prisma.dailyStat.upsert({
        where: { date_entityType_entityId: { date: yesterday, entityType: "article", entityId: av.article_id } },
        create: {
          date: yesterday, entityType: "article", entityId: av.article_id,
          pageViews: Number(av.views),
          uniqueVisitors: Number(av.unique_visitors),
          avgTimeOnPage: av.avg_time,
          avgScrollDepth: av.avg_scroll,
        },
        update: {
          pageViews: Number(av.views),
          uniqueVisitors: Number(av.unique_visitors),
          avgTimeOnPage: av.avg_time,
          avgScrollDepth: av.avg_scroll,
        },
      });
    }

    return { date: yesterday, pageViews, uniqueVisitors, sessions: sessions };
  },
};
