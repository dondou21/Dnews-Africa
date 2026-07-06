import prisma from "../utils/prisma";

export const contactRepository = {
  create: (data: { name: string; email: string; subject: string; message: string }) =>
    prisma.contactMessage.create({ data }),

  findAll: () =>
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
};
