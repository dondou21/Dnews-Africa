import prisma from "../utils/prisma";

export const trackingRepository = {
  async createSession(data: {
    anonymousId: string; country?: string; region?: string; city?: string;
    timezone?: string; language?: string; deviceType?: string; browser?: string;
    browserVersion?: string; os?: string; osVersion?: string; deviceModel?: string;
    screenWidth?: number; screenHeight?: number; referrer?: string; referrerUrl?: string;
    utmSource?: string; utmMedium?: string; utmCampaign?: string; utmTerm?: string; utmContent?: string;
  }) {
    const existing = data.anonymousId ? await prisma.visitorSession.findFirst({
      where: { anonymousId: data.anonymousId, endTime: null },
      orderBy: { createdAt: "desc" },
    }) : null;

    if (existing) {
      return existing;
    }

    const previousSessions = data.anonymousId ? await prisma.visitorSession.count({
      where: { anonymousId: data.anonymousId },
    }) : 0;

    return prisma.visitorSession.create({
      data: {
        anonymousId: data.anonymousId,
        isReturning: previousSessions > 0,
        country: data.country, region: data.region, city: data.city,
        timezone: data.timezone, language: data.language,
        deviceType: (data.deviceType as any) ?? "UNKNOWN",
        browser: data.browser, browserVersion: data.browserVersion,
        os: data.os, osVersion: data.osVersion, deviceModel: data.deviceModel,
        screenWidth: data.screenWidth, screenHeight: data.screenHeight,
        referrer: data.referrer, referrerUrl: data.referrerUrl,
        utmSource: data.utmSource, utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign, utmTerm: data.utmTerm, utmContent: data.utmContent,
      },
    });
  },

  async updateSession(sessionId: string, data: { duration?: number; pageViews?: number; isBounced?: boolean; endTime?: Date }) {
    return prisma.visitorSession.update({ where: { id: sessionId }, data });
  },

  async createPageView(data: {
    path: string; title?: string; sessionId: string; visitorId: string;
    referrer?: string; referrerUrl?: string; entityType?: string; entityId?: string;
    timeOnPage?: number; scrollDepth?: number; country?: string; region?: string;
    city?: string; language?: string; deviceType?: string; browser?: string;
    os?: string; trafficSource?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string;
  }) {
    return prisma.pageView.create({
      data: {
        path: data.path, title: data.title, sessionId: data.sessionId,
        visitorId: data.visitorId, referrer: data.referrer, referrerUrl: data.referrerUrl,
        entityType: data.entityType, entityId: data.entityId,
        timeOnPage: data.timeOnPage, scrollDepth: data.scrollDepth,
        country: data.country, region: data.region, city: data.city,
        language: data.language, deviceType: (data.deviceType as any) ?? "UNKNOWN",
        browser: data.browser, os: data.os,
        trafficSource: (data.trafficSource as any) ?? "DIRECT",
        utmSource: data.utmSource, utmMedium: data.utmMedium, utmCampaign: data.utmCampaign,
      },
    });
  },

  async createArticleView(data: {
    articleId: string; title: string; sessionId: string; visitorId: string;
    referrer?: string; timeOnPage?: number; scrollDepth?: number;
    completionRate?: number; isCompleted?: boolean; trafficSource?: string;
  }) {
    return prisma.articleView.create({ data: { ...data, trafficSource: (data.trafficSource as any) ?? "DIRECT" } });
  },

  async createEvent(data: {
    eventType: string; eventData?: any; sessionId: string; visitorId: string;
    pageViewId?: string; entityType?: string; entityId?: string; value?: number;
  }) {
    return prisma.readerEvent.create({ data });
  },

  async createSearchQuery(data: {
    query: string; normalized: string; resultsCount: number;
    noResults: boolean; sessionId: string; visitorId: string; source?: string;
  }) {
    return prisma.searchQuery.create({ data });
  },

  async endSession(sessionId: string) {
    const now = new Date();
    const session = await prisma.visitorSession.findUnique({ where: { id: sessionId } });
    if (!session) return null;

    const duration = Math.round((now.getTime() - session.startTime.getTime()) / 1000);
    const pageViews = await prisma.pageView.count({ where: { sessionId } });
    const isBounced = pageViews <= 1;

    return prisma.visitorSession.update({
      where: { id: sessionId },
      data: { endTime: now, duration, pageViews, isBounced },
    });
  },
};
