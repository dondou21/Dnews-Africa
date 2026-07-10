import { settingsRepository } from "../repositories/settingsRepository";
import { logger } from "../utils/logger";

export const settingsService = {
  async get() {
    return settingsRepository.get();
  },

  async update(data: Record<string, unknown>) {
    const settings = await settingsRepository.update(data);
    logger.info("SettingsService", "Settings updated");
    return settings;
  },
};
