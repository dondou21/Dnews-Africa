import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { logger } from "../utils/logger";

export const trackingController = {
  async trackOpen(req: Request, res: Response) {
    const { campaignId, subscriberId } = req.params;
    try {
      await prisma.newsletterOpen.create({
        data: { campaignId, subscriberId },
      });
      await prisma.newsletterCampaignRecipient.updateMany({
        where: { campaignId, subscriberId, openedAt: null },
        data: { openedAt: new Date() },
      });
    } catch (err) {
      logger.error("Tracking", "Failed to track open", { campaignId, subscriberId, error: String(err) });
    }
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.end(pixel, "binary");
  },

  async trackClick(req: Request, res: Response, next: NextFunction) {
    const { campaignId, subscriberId } = req.params;
    const { url, articleId } = req.query;

    if (!url || typeof url !== "string") {
      return res.redirect(process.env.CLIENT_URL || "http://localhost:3000");
    }

    try {
      await prisma.newsletterClick.create({
        data: {
          campaignId,
          subscriberId,
          url,
          articleId: typeof articleId === "string" ? articleId : null,
        },
      });
      await prisma.newsletterCampaignRecipient.updateMany({
        where: { campaignId, subscriberId, clickedAt: null },
        data: { clickedAt: new Date() },
      });
      await prisma.newsletterCampaign.update({
        where: { id: campaignId },
        data: { totalClicked: { increment: 1 } },
      });
    } catch (err) {
      logger.error("Tracking", "Failed to track click", { campaignId, subscriberId, error: String(err) });
    }

    res.redirect(301, url);
  },

  async getCampaignAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
        include: {
          _count: { select: { opens: true, clicks: true } },
          analytics: true,
        },
      });

      if (!campaign) {
        return res.status(404).json({ status: "error", message: "Campaign not found" });
      }

      const [opens, clicks, recipients] = await Promise.all([
        prisma.newsletterOpen.findMany({
          where: { campaignId: id },
          orderBy: { openedAt: "desc" },
          take: 100,
        }),
        prisma.newsletterClick.findMany({
          where: { campaignId: id },
          orderBy: { clickedAt: "desc" },
          take: 100,
          include: { campaign: { select: { title: true } } },
        }),
        prisma.newsletterCampaignRecipient.findMany({
          where: { campaignId: id },
          select: { id: true, status: true, sentAt: true, openedAt: true, clickedAt: true, failedAt: true, errorMessage: true },
        }),
      ]);

      res.json({
        status: "success",
        data: {
          totalRecipients: campaign.totalRecipients,
          totalSent: campaign.totalSent,
          totalFailed: campaign.totalFailed,
          totalOpened: campaign.totalOpened || opens.length,
          totalClicked: campaign.totalClicked || clicks.length,
          openRate: campaign.totalRecipients > 0 ? ((campaign.totalOpened || opens.length) / campaign.totalRecipients * 100).toFixed(2) : "0",
          clickRate: campaign.totalRecipients > 0 ? ((campaign.totalClicked || clicks.length) / campaign.totalRecipients * 100).toFixed(2) : "0",
          analytics: campaign.analytics,
          recentOpens: opens,
          recentClicks: clicks,
          recipients,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getDashboardAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalSubscribers,
        activeSubscribers,
        totalCampaigns,
        sentCampaigns,
        totalOpens,
        totalClicks,
        recentCampaigns,
        subscriberGrowth,
      ] = await Promise.all([
        prisma.newsletterSubscriber.count(),
        prisma.newsletterSubscriber.count({ where: { status: "ACTIVE", verified: true } }),
        prisma.newsletterCampaign.count(),
        prisma.newsletterCampaign.count({ where: { status: "SENT" } }),
        prisma.newsletterOpen.count(),
        prisma.newsletterClick.count(),
        prisma.newsletterCampaign.findMany({
          where: { status: "SENT" },
          orderBy: { sentAt: "desc" },
          take: 5,
          select: { id: true, title: true, totalRecipients: true, totalOpened: true, totalClicked: true, sentAt: true },
        }),
        prisma.newsletterSubscriber.groupBy({
          by: ["createdAt"],
          _count: { id: true },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
      ]);

      const totalRecipients = await prisma.newsletterCampaignRecipient.count();
      const totalDelivered = await prisma.newsletterCampaignRecipient.count({ where: { status: "SENT" } });
      const totalFailed = await prisma.newsletterCampaignRecipient.count({ where: { status: "FAILED" } });
      const unsubscribed = await prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } });

      res.json({
        status: "success",
        data: {
          subscribers: {
            total: totalSubscribers,
            active: activeSubscribers,
            unsubscribed,
            growth: subscriberGrowth.map((g) => ({ date: g.createdAt, count: g._count.id })),
          },
          campaigns: {
            total: totalCampaigns,
            sent: sentCampaigns,
            recent: recentCampaigns,
          },
          delivery: {
            total: totalRecipients,
            delivered: totalDelivered,
            failed: totalFailed,
            deliveryRate: totalRecipients > 0 ? (totalDelivered / totalRecipients * 100).toFixed(2) : "0",
          },
          engagement: {
            totalOpens,
            totalClicks,
            openRate: totalDelivered > 0 ? (totalOpens / totalDelivered * 100).toFixed(2) : "0",
            clickRate: totalDelivered > 0 ? (totalClicks / totalDelivered * 100).toFixed(2) : "0",
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
