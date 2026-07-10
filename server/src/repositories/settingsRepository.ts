import prisma from "../utils/prisma";

export const settingsRepository = {
  async get() {
    let settings = await prisma.newsletterSettings.findFirst();
    if (!settings) {
      settings = await prisma.newsletterSettings.create({ data: {} });
    }
    return settings;
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
    return settings;
  },
};
