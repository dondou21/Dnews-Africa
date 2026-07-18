import prisma from "../utils/prisma";

export const roleRepository = {
  findAll: () =>
    prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    }),

  findById: (id: number) =>
    prisma.role.findUnique({ where: { id } }),

  findByName: (name: string) =>
    prisma.role.findUnique({ where: { name } }),
};
