import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const templateRepository = {
  findAll: () =>
    prisma.newsletterTemplate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),

  findById: (id: string) =>
    prisma.newsletterTemplate.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),

  getDefault: () =>
    prisma.newsletterTemplate.findFirst({ where: { isDefault: true } }),

  create: (data: Prisma.NewsletterTemplateCreateInput) =>
    prisma.newsletterTemplate.create({ data }),

  update: (id: string, data: Prisma.NewsletterTemplateUpdateInput) =>
    prisma.newsletterTemplate.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.newsletterTemplate.delete({ where: { id } }),

  unsetDefault: () =>
    prisma.newsletterTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    }),

  duplicate: async (id: string, newName: string, userId: string) => {
    const original = await prisma.newsletterTemplate.findUnique({ where: { id } });
    if (!original) return null;
    return prisma.newsletterTemplate.create({
      data: {
        name: newName,
        description: original.description,
        subject: original.subject,
        content: original.content,
        thumbnail: original.thumbnail,
        isDefault: false,
        createdById: userId,
      },
    });
  },
};
