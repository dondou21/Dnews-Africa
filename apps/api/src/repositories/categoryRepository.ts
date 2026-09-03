import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";
import { cache } from "../utils/cache";

const CACHE_TTL = 5 * 60 * 1000;
const ALL_KEY = "categories:all";
const CATEGORY_CACHE_PREFIX = "categories:detail:";

const categoryInclude: Prisma.CategoryInclude = {
  _count: { select: { articles: true, children: true } },
  parent: { select: { id: true, name: true, slug: true, displayOrder: true } },
  children: {
    select: { id: true, name: true, slug: true, description: true, displayOrder: true, isActive: true },
    orderBy: [{ displayOrder: "asc" as const }, { name: "asc" as const }],
  },
};

export const categoryRepository = {
  findAll: () =>
    cache.wrap(ALL_KEY, CACHE_TTL, () =>
      prisma.category.findMany({
        include: categoryInclude,
        orderBy: [{ parentId: { sort: "asc", nulls: "first" } }, { displayOrder: "asc" }, { name: "asc" }],
      })
    ),

  findById: (id: number) =>
    prisma.category.findUnique({ where: { id }, include: categoryInclude }),

  findBySlug: (slug: string) =>
    cache.wrap(`${CATEGORY_CACHE_PREFIX}${slug}`, CACHE_TTL, () =>
      prisma.category.findUnique({
        where: { slug },
        include: categoryInclude,
      })
    ),

  findByName: (name: string) =>
    prisma.category.findUnique({ where: { name } }),

  findParents: () =>
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { articles: true } },
        children: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),

  findByParent: (parentId: number) =>
    prisma.category.findMany({
      where: { parentId },
      orderBy: { name: "asc" },
    }),

  findDescendantSlugs: async (slug: string): Promise<string[]> => {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          select: { slug: true, children: { select: { slug: true } } },
        },
      },
    });
    if (!category) return [slug];

    const slugs = [category.slug];
    for (const child of category.children) {
      slugs.push(child.slug);
      for (const grandchild of child.children) {
        slugs.push(grandchild.slug);
      }
    }
    return slugs;
  },

  create: async (data: { name: string; slug: string; description?: string; parentId?: number | null; displayOrder?: number; isActive?: boolean }) => {
    const category = await prisma.category.create({
      data,
      include: categoryInclude,
    });
    cache.del(ALL_KEY);
    cache.clearPrefix(CATEGORY_CACHE_PREFIX);
    return category;
  },

  update: async (id: number, data: { name?: string; slug?: string; description?: string; parentId?: number | null; displayOrder?: number; isActive?: boolean }) => {
    const category = await prisma.category.update({
      where: { id },
      data,
      include: categoryInclude,
    });
    cache.del(ALL_KEY);
    cache.clearPrefix(CATEGORY_CACHE_PREFIX);
    return category;
  },

  delete: async (id: number) => {
    const result = await prisma.category.delete({ where: { id } });
    cache.del(ALL_KEY);
    cache.clearPrefix(CATEGORY_CACHE_PREFIX);
    return result;
  },

  findArticlesBySlug: (slug: string) =>
    cache.wrap(`${CATEGORY_CACHE_PREFIX}articles:${slug}`, CACHE_TTL, () =>
      prisma.category.findUnique({
        where: { slug },
        include: {
          articles: {
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          children: {
            include: {
              articles: {
                where: { status: "PUBLISHED" },
                orderBy: { publishedAt: "desc" },
                include: {
                  author: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ),
};
