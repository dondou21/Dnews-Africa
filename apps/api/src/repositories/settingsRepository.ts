import prisma from "../utils/prisma";
import { cache } from "../utils/cache";

const CACHE_TTL = 5 * 60 * 1000;
const KEY = "settings:newsletter";

export const settingsRepository = {
  async get() {
    return cache.wrap(KEY, CACHE_TTL, async () => {
      let settings = await prisma.newsletterSettings.findFirst();
      if (!settings) {
        settings = await prisma.newsletterSettings.create({ data: {} });
      }
      return settings;
    });
  },

  async update(data: Record<string, unknown>) {
    let settings = await prisma.newsletterSettings.findFirst();
    if (!settings) {
      settings = await prisma.newsletterSettings.create({ data });
    } else {
      settings = await prisma.newsletterSettings.update({
        where: { id: settings.id },
        data,
      });
    }
    cache.del(KEY);
    return settings;
  },
};
