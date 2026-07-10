import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const automationRepository = {
  findAll: () =>
    prisma.newsletterAutomation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        template: { select: { id: true, name: true, subject: true } },
      },
    }),

  findById: (id: string) =>
    prisma.newsletterAutomation.findUnique({
      where: { id },
      include: { template: true },
    }),

  findEnabled: () =>
    prisma.newsletterAutomation.findMany({
      where: { enabled: true },
      include: { template: true },
    }),

  create: (data: Prisma.NewsletterAutomationCreateInput) =>
    prisma.newsletterAutomation.create({ data }),

  update: (id: string, data: Prisma.NewsletterAutomationUpdateInput) =>
    prisma.newsletterAutomation.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.newsletterAutomation.delete({ where: { id } }),
};
