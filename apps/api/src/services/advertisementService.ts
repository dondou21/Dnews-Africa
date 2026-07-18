import { $Enums } from "@prisma/client";
import { advertisementRepository } from "../repositories/advertisementRepository";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";
import type { AuthenticatedUser } from "../types/express";

export const advertisementService = {
  async getAll(params: {
    page?: number; limit?: number; search?: string; status?: string; placement?: string; type?: string; advertiserId?: string; campaignId?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const [ads, total] = await advertisementRepository.findAll({
      page, limit,
      search: params.search, status: params.status, placement: params.placement,
      type: params.type, advertiserId: params.advertiserId, campaignId: params.campaignId,
    });
    return { advertisements: ads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const ad = await advertisementRepository.findById(id);
    if (!ad) throw new AppError("Advertisement not found", 404);
    return ad;
  },

  async create(data: {
    title: string; type: string; placement: string; targetUrl: string; advertiserId: string;
    campaignId?: string; imageId?: string; videoId?: string; buttonText?: string; description?: string;
    startDate?: string; endDate?: string; priority?: number; maxImpressions?: number; maxClicks?: number;
    rotation?: string; weight?: number;
  }, user: AuthenticatedUser) {
    const ad = await advertisementRepository.create({
      title: data.title,
      type: data.type as $Enums.AdType,
      placement: data.placement as $Enums.AdPlacement,
      targetUrl: data.targetUrl,
      advertiser: { connect: { id: data.advertiserId } },
      campaign: data.campaignId ? { connect: { id: data.campaignId } } : undefined,
      image: data.imageId ? { connect: { id: data.imageId } } : undefined,
      video: data.videoId ? { connect: { id: data.videoId } } : undefined,
      buttonText: data.buttonText || null,
      description: data.description || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      priority: data.priority || 0,
      maxImpressions: data.maxImpressions || null,
      maxClicks: data.maxClicks || null,
      rotation: (data.rotation as $Enums.AdRotation) || "RANDOM",
      weight: data.weight || 1,
      createdBy: { connect: { id: user.id } },
    });
    logger.info("AdService", "Advertisement created", { id: ad.id });
    return ad;
  },

  async update(id: string, data: Record<string, unknown>, user: AuthenticatedUser) {
    const existing = await advertisementRepository.findById(id);
    if (!existing) throw new AppError("Advertisement not found", 404);

    const updateData: Record<string, unknown> = {};
    const directFields = ["title", "type", "placement", "targetUrl", "buttonText", "description",
      "priority", "status", "rotation", "weight", "maxImpressions", "maxClicks"];
    for (const field of directFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate as string) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate as string) : null;
    if (data.advertiserId !== undefined) updateData.advertiser = { connect: { id: data.advertiserId } };
    if (data.campaignId !== undefined) updateData.campaign = data.campaignId ? { connect: { id: data.campaignId } } : null;
    if (data.imageId !== undefined) updateData.image = data.imageId ? { connect: { id: data.imageId } } : null;
    if (data.videoId !== undefined) updateData.video = data.videoId ? { connect: { id: data.videoId } } : null;

    const ad = await advertisementRepository.update(id, updateData);
    logger.info("AdService", "Advertisement updated", { id });
    return ad;
  },

  async delete(id: string) {
    const existing = await advertisementRepository.findById(id);
    if (!existing) throw new AppError("Advertisement not found", 404);
    await advertisementRepository.delete(id);
    logger.info("AdService", "Advertisement deleted", { id });
  },

  async getByPlacement(placement: string, limit?: number) {
    return advertisementRepository.findActiveByPlacement(placement, limit || 1);
  },

  async trackImpression(id: string) {
    await advertisementRepository.incrementImpressions(id);
  },

  async trackClick(id: string) {
    await advertisementRepository.incrementClicks(id);
  },

  async getStats() {
    const [total, active, paused, expired, aggregated] = await advertisementRepository.getStats();
    return {
      total, active, paused, expired,
      totalImpressions: aggregated._sum.impressions || 0,
      totalClicks: aggregated._sum.clicks || 0,
      ctr: (aggregated._sum.impressions || 0) > 0
        ? ((aggregated._sum.clicks || 0) / (aggregated._sum.impressions || 0) * 100).toFixed(2)
        : "0",
    };
  },
};
