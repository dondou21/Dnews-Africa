import prisma from "../utils/prisma";

export const categoryRepository = {
  findAll: () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),

  findBySlug: (slug: string) =>
    prisma.category.findUnique({
      where: { slug },
    }),

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
