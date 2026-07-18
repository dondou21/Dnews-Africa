import prisma from "../utils/prisma";

export const contactRepository = {
  create: (data: { name: string; email: string; subject: string; message: string }) =>
    prisma.contactMessage.create({ data }),

  findById: (id: string) =>
    prisma.contactMessage.findUnique({ where: { id } }),

  findAll: () =>
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),

  update: (id: string, data: { isRead?: boolean }) =>
    prisma.contactMessage.update({
      where: { id },
      data,
    }),

  delete: (id: string) =>
    prisma.contactMessage.delete({ where: { id } }),
};
