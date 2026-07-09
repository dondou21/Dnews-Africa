import prisma from "../utils/prisma";

export const categoryRepository = {
  findAll: () =>
    prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    }),

  findById: (id: number) =>
    prisma.category.findUnique({ where: { id } }),

  findBySlug: (slug: string) =>
    prisma.category.findUnique({
      where: { slug },
    }),

  findByName: (name: string) =>
    prisma.category.findUnique({ where: { name } }),

  create: (data: { name: string; slug: string; description?: string }) =>
    prisma.category.create({
      data,
      include: { _count: { select: { articles: true } } },
    }),

  update: (id: number, data: { name?: string; slug?: string; description?: string }) =>
    prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { articles: true } } },
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
      },
    }),
};
