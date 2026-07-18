import { trackingRepository } from "../repositories/trackingRepository";

function inferTrafficSource(referrer?: string, utmSource?: string): string {
  if (utmSource) return utmSource.toUpperCase().replace(/\s+/g, "_");
  if (!referrer) return "DIRECT";
  const r = referrer.toLowerCase();
  if (r.includes("google")) return "GOOGLE_SEARCH";
  if (r.includes("facebook")) return "FACEBOOK";
  if (r.includes("twitter") || r.includes("x.com")) return "TWITTER";
  if (r.includes("linkedin")) return "LINKEDIN";
  if (r.includes("whatsapp")) return "WHATSAPP";
  if (r.includes("newsletter")) return "NEWSLETTER";
  return "REFERRAL";
}

export const trackingService = {
  async trackPageView(data: {
    path: string; title?: string; anonymousId: string; sessionId?: string;
    referrer?: string; referrerUrl?: string; entityType?: string; entityId?: string;
    country?: string; region?: string; city?: string; language?: string;
    deviceType?: string; browser?: string; os?: string;
    utmSource?: string; utmMedium?: string; utmCampaign?: string;
    screenWidth?: number; screenHeight?: number;
    timezone?: string; browserVersion?: string; osVersion?: string; deviceModel?: string;
  }) {
    const trafficSource = inferTrafficSource(data.referrer, data.utmSource);

    let session = data.sessionId ? await trackingRepository.updateSession(data.sessionId, {}) : null;
    if (!session && data.anonymousId) {
      session = await trackingRepository.createSession({
        anonymousId: data.anonymousId,
        country: data.country, region: data.region, city: data.city,
        timezone: data.timezone, language: data.language,
        deviceType: data.deviceType, browser: data.browser,
        browserVersion: data.browserVersion, os: data.os,
        osVersion: data.osVersion, deviceModel: data.deviceModel,
        screenWidth: data.screenWidth, screenHeight: data.screenHeight,
        referrer: data.referrer, referrerUrl: data.referrerUrl,
        utmSource: data.utmSource, utmMedium: data.utmMedium, utmCampaign: data.utmCampaign,
      });
    }

    if (!session) {
      session = await trackingRepository.createSession({
        anonymousId: data.anonymousId || "anonymous",
        country: data.country, deviceType: data.deviceType,
      });
    }

    const pageView = await trackingRepository.createPageView({
      path: data.path, title: data.title, sessionId: session.id,
      visitorId: data.anonymousId || session.anonymousId,
      referrer: data.referrer, referrerUrl: data.referrerUrl,
      entityType: data.entityType, entityId: data.entityId,
      country: data.country, region: data.region, city: data.city,
      language: data.language, deviceType: data.deviceType,
      browser: data.browser, os: data.os,
      trafficSource, utmSource: data.utmSource, utmMedium: data.utmMedium, utmCampaign: data.utmCampaign,
    });

    if (data.entityType === "article" && data.entityId) {
      await trackingRepository.createArticleView({
        articleId: data.entityId, title: data.title ?? "",
        sessionId: session.id, visitorId: data.anonymousId || session.anonymousId,
        referrer: data.referrer, trafficSource,
      }).catch(() => {});
    }

    return { sessionId: session.id, pageViewId: pageView.id };
  },

  async trackEvent(data: {
    eventType: string; eventData?: any; sessionId: string; visitorId: string;
    pageViewId?: string; entityType?: string; entityId?: string; value?: number;
  }) {
    return trackingRepository.createEvent(data);
  },

  async trackSearch(data: {
    query: string; resultsCount: number; sessionId: string;
    visitorId: string; source?: string;
  }) {
    const normalized = data.query.toLowerCase().trim();
    return trackingRepository.createSearchQuery({
      query: data.query, normalized, resultsCount: data.resultsCount,
      noResults: data.resultsCount === 0,
      sessionId: data.sessionId, visitorId: data.visitorId, source: data.source,
    });
  },

  async trackArticleEngagement(data: {
    articleId: string; title: string; sessionId: string; visitorId: string;
    timeOnPage?: number; scrollDepth?: number; completionRate?: number;
    isCompleted?: boolean; referrer?: string; trafficSource?: string;
  }) {
    return trackingRepository.createArticleView(data);
  },

  async endSession(sessionId: string) {
    return trackingRepository.endSession(sessionId);
  },
};
