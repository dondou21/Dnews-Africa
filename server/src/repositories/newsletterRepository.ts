import prisma from "../utils/prisma";

export const newsletterRepository = {
  findByEmail: (email: string) =>
    prisma.newsletterSubscriber.findUnique({ where: { email } }),

  create: (data: { email: string; name?: string }) =>
    prisma.newsletterSubscriber.create({ data }),

  findAll: () =>
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
    }),

  delete: (id: string) =>
    prisma.newsletterSubscriber.delete({ where: { id } }),
};
