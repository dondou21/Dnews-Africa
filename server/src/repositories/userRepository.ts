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
};
