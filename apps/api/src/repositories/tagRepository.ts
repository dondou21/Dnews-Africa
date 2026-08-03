import prisma from "../utils/prisma";
import { cache } from "../utils/cache";

const CACHE_TTL = 5 * 60 * 1000;
const ALL_KEY = "tags:all";

export const tagRepository = {
  findAll: () =>
    cache.wrap(ALL_KEY, CACHE_TTL, () =>
      prisma.tag.findMany({
        include: { _count: { select: { articles: true } } },
        orderBy: { name: "asc" },
      })
    ),

  findById: (id: number) =>
    prisma.tag.findUnique({ where: { id } }),

  findBySlug: (slug: string) =>
    prisma.tag.findUnique({ where: { slug } }),

  findByName: (name: string) =>
    prisma.tag.findUnique({ where: { name } }),

  create: async (data: { name: string; slug: string }) => {
    const tag = await prisma.tag.create({
      data,
      include: { _count: { select: { articles: true } } },
    });
    cache.del(ALL_KEY);
    return tag;
  },

  update: async (id: number, data: { name?: string; slug?: string }) => {
    const tag = await prisma.tag.update({
      where: { id },
      data,
      include: { _count: { select: { articles: true } } },
    });
    cache.del(ALL_KEY);
    return tag;
  },

  delete: async (id: number) => {
    const result = await prisma.tag.delete({ where: { id } });
    cache.del(ALL_KEY);
    return result;
  },
};
