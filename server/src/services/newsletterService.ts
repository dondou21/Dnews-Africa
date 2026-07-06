import { newsletterRepository } from "../repositories/newsletterRepository";
import { AppError } from "../middlewares/errorHandler";

export const newsletterService = {
  async subscribe(data: { email: string; name?: string }) {
    const existing = await newsletterRepository.findByEmail(data.email);
    if (existing) {
      if (existing.isActive) {
        throw new AppError("Email is already subscribed", 409);
      }
      await newsletterRepository.delete(existing.id);
    }
    return newsletterRepository.create(data);
  },

  async getAll() {
    return newsletterRepository.findAll();
  },

  async unsubscribe(id: string) {
    try {
      return await newsletterRepository.delete(id);
    } catch {
      throw new AppError("Subscriber not found", 404);
    }
  },
};
