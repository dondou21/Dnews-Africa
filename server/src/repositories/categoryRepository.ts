import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

const categoryInclude = {
  _count: { select: { articles: true, children: true } },
  parent: { select: { id: true, name: true, slug: true } },
  children: {
    select: { id: true, name: true, slug: true, description: true },
    orderBy: { name: "asc" as const },
  },
} satisfies Prisma.CategoryInclude;

export const categoryRepository = {
  findAll: () =>
    prisma.category.findMany({
      include: categoryInclude,
      orderBy: [{ parentId: { sort: "asc", nulls: "first" } }, { name: "asc" }],
    }),

  findById: (id: number) =>
    prisma.category.findUnique({ where: { id }, include: categoryInclude }),

  findBySlug: (slug: string) =>
    prisma.category.findUnique({
      where: { slug },
      include: categoryInclude,
    }),

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

  create: (data: { name: string; slug: string; description?: string; parentId?: number | null }) =>
    prisma.category.create({
      data,
      include: categoryInclude,
    }),

  update: (id: number, data: { name?: string; slug?: string; description?: string; parentId?: number | null }) =>
    prisma.category.update({
      where: { id },
      data,
      include: categoryInclude,
    }),

  delete: (id: number) =>
    prisma.category.delete({ where: { id } }),

  findArticlesBySlug: (slug: string) =>
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
};
