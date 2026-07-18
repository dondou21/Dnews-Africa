import { advertiserRepository } from "../repositories/advertiserRepository";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";

export const advertiserService = {
  async getAll(params: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const [advertisers, total] = await advertiserRepository.findAll({ page, limit, search: params.search, status: params.status });
    return {
      advertisers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const advertiser = await advertiserRepository.findById(id);
    if (!advertiser) throw new AppError("Advertiser not found", 404);
    return advertiser;
  },

  async create(data: { companyName: string; contactName?: string; email?: string; phone?: string; website?: string; logoUrl?: string; notes?: string }) {
    const advertiser = await advertiserRepository.create({
      companyName: data.companyName,
      contactName: data.contactName || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      notes: data.notes || null,
    });
    logger.info("AdvertiserService", "Advertiser created", { id: advertiser.id });
    return advertiser;
  },

  async update(id: string, data: Record<string, unknown>) {
    const existing = await advertiserRepository.findById(id);
    if (!existing) throw new AppError("Advertiser not found", 404);
    const advertiser = await advertiserRepository.update(id, data);
    logger.info("AdvertiserService", "Advertiser updated", { id });
    return advertiser;
  },

  async delete(id: string) {
    const existing = await advertiserRepository.findById(id);
    if (!existing) throw new AppError("Advertiser not found", 404);
    await advertiserRepository.delete(id);
    logger.info("AdvertiserService", "Advertiser deleted", { id });
  },

  async list() {
    return advertiserRepository.list();
  },
};
