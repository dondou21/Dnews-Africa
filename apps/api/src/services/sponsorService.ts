import { AppError } from "../middlewares/errorHandler";
import {
  sponsorRepository,
  SponsorQueryParams,
  CreateSponsorInput,
  UpdateSponsorInput,
} from "../repositories/sponsorRepository";

export const sponsorService = {
  async getActive() {
    return sponsorRepository.findActive();
  },

  async getAll(params: SponsorQueryParams) {
    return sponsorRepository.findAll(params);
  },

  async getById(id: string) {
    const sponsor = await sponsorRepository.findById(id);
    if (!sponsor) throw new AppError("Sponsor not found", 404);
    return sponsor;
  },

  async create(data: CreateSponsorInput) {
    return sponsorRepository.create(data);
  },

  async update(id: string, data: UpdateSponsorInput) {
    await this.getById(id);
    return sponsorRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return sponsorRepository.delete(id);
  },
};
