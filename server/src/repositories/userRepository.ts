import prisma from "../utils/prisma";

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      include: { role: true },
    }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: { role: true },
    }),

  create: (data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleId: number;
  }) =>
    prisma.user.create({
      data,
      include: { role: true },
    }),

  findAll: () =>
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),

  update: (id: string, data: Record<string, unknown>) =>
    prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    }),

  delete: (id: string) =>
    prisma.user.delete({ where: { id } }),
};
