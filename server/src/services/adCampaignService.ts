import { adCampaignRepository } from "../repositories/adCampaignRepository";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";

export const adCampaignService = {
  async getAll(params: { page?: number; limit?: number; search?: string; status?: string; advertiserId?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const [campaigns, total] = await adCampaignRepository.findAll({ page, limit, search: params.search, status: params.status, advertiserId: params.advertiserId });
    return { campaigns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const campaign = await adCampaignRepository.findById(id);
    if (!campaign) throw new AppError("Campaign not found", 404);
    return campaign;
  },

  async create(data: { name: string; advertiserId: string; budget?: number; startDate?: string; endDate?: string }) {
    const campaign = await adCampaignRepository.create({
      name: data.name,
      budget: data.budget || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      advertiser: { connect: { id: data.advertiserId } },
    });
    logger.info("AdCampaignService", "Campaign created", { id: campaign.id });
    return campaign;
  },

  async update(id: string, data: Record<string, unknown>) {
    const existing = await adCampaignRepository.findById(id);
    if (!existing) throw new AppError("Campaign not found", 404);

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate as string) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate as string) : null;
    if (data.advertiserId !== undefined) updateData.advertiser = { connect: { id: data.advertiserId } };

    const campaign = await adCampaignRepository.update(id, updateData);
    logger.info("AdCampaignService", "Campaign updated", { id });
    return campaign;
  },

  async delete(id: string) {
    const existing = await adCampaignRepository.findById(id);
    if (!existing) throw new AppError("Campaign not found", 404);
    await adCampaignRepository.delete(id);
    logger.info("AdCampaignService", "Campaign deleted", { id });
  },
};
