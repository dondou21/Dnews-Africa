import { Request, Response, NextFunction } from "express";
import { trackingService } from "../services/trackingService";
import { pageViewSchema, trackingEventSchema, searchQuerySchema, sessionSchema } from "../validators/analyticsValidator";

export const trackingController = {
  async trackPageView(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = pageViewSchema.parse(req.body);
      const data = await trackingService.trackPageView({
        path: parsed.path,
        title: parsed.title,
        anonymousId: req.body.anonymousId || req.ip || "anonymous",
        sessionId: parsed.sessionId,
        referrer: parsed.referrer,
        referrerUrl: parsed.referrerUrl,
        entityType: parsed.entityType,
        entityId: parsed.entityId,
        country: req.body.country,
        region: req.body.region,
        city: req.body.city,
        language: req.body.language,
        deviceType: req.body.deviceType,
        browser: req.body.browser,
        os: req.body.os,
        utmSource: req.body.utmSource,
        utmMedium: req.body.utmMedium,
        utmCampaign: req.body.utmCampaign,
        screenWidth: req.body.screenWidth,
        screenHeight: req.body.screenHeight,
        timezone: req.body.timezone,
        browserVersion: req.body.browserVersion,
        osVersion: req.body.osVersion,
        deviceModel: req.body.deviceModel,
      });
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = trackingEventSchema.parse(req.body);
      const data = await trackingService.trackEvent({
        ...parsed,
        sessionId: req.body.sessionId,
        visitorId: req.body.visitorId || req.body.anonymousId || "anonymous",
      } as any);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async trackSession(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = sessionSchema.parse(req.body);
      const data = await trackingService.trackPageView({
        path: req.body.path || "/",
        anonymousId: parsed.anonymousId,
        sessionId: parsed.sessionId,
        country: parsed.country, region: parsed.region, city: parsed.city,
        timezone: parsed.timezone, language: parsed.language,
        deviceType: parsed.deviceType, browser: parsed.browser,
        browserVersion: parsed.browserVersion, os: parsed.os,
        osVersion: parsed.osVersion, deviceModel: parsed.deviceModel,
        screenWidth: parsed.screenWidth, screenHeight: parsed.screenHeight,
        referrer: parsed.referrer, referrerUrl: parsed.referrerUrl,
        utmSource: parsed.utmSource, utmMedium: parsed.utmMedium, utmCampaign: parsed.utmCampaign,
      });
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async trackSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = searchQuerySchema.parse(req.body);
      const data = await trackingService.trackSearch({
        query: parsed.query,
        resultsCount: parsed.resultsCount ?? 0,
        sessionId: req.body.sessionId || "unknown",
        visitorId: req.body.visitorId || req.body.anonymousId || "anonymous",
        source: parsed.source,
      });
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async endSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ status: "error", message: "sessionId required" });
      const data = await trackingService.endSession(sessionId);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },
};
