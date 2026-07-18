import prisma from "../utils/prisma";

export const tagRepository = {
  findAll: () =>
    prisma.tag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    }),

  findById: (id: number) =>
    prisma.tag.findUnique({ where: { id } }),

  findBySlug: (slug: string) =>
    prisma.tag.findUnique({ where: { slug } }),

  findByName: (name: string) =>
    prisma.tag.findUnique({ where: { name } }),

  create: (data: { name: string; slug: string }) =>
    prisma.tag.create({
      data,
      include: { _count: { select: { articles: true } } },
    }),

  update: (id: number, data: { name?: string; slug?: string }) =>
    prisma.tag.update({
      where: { id },
      data,
      include: { _count: { select: { articles: true } } },
    }),

  delete: (id: number) =>
    prisma.tag.delete({ where: { id } }),
};
