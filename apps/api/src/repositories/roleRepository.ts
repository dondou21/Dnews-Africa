import prisma from "../utils/prisma";
import { cache } from "../utils/cache";

const CACHE_TTL = 10 * 60 * 1000;
const ALL_KEY = "roles:all";

export const roleRepository = {
  findAll: async () =>
    cache.wrap(ALL_KEY, CACHE_TTL, () =>
      prisma.role.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: "asc" },
      })
    ),

  findById: (id: number) =>
    prisma.role.findUnique({ where: { id } }),

  findByName: (name: string) =>
    prisma.role.findUnique({ where: { name } }),

  invalidate: () => cache.del(ALL_KEY),
};
