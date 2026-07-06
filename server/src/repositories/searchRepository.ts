import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";

const articleInclude = {
  category: { select: { id: true, name: true, slug: true } },
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

export interface SearchParams {
  q?: string;
  category?: string;
  tag?: string;
  page: number;
  limit: number;
  sort: string;
}

export const searchRepository = {
  async search(params: SearchParams) {
    const where: Prisma.ArticleWhereInput = { status: "PUBLISHED" };

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: "insensitive" } },
        { summary: { contains: params.q, mode: "insensitive" } },
        { content: { contains: params.q, mode: "insensitive" } },
        { category: { name: { contains: params.q, mode: "insensitive" } } },
        {
          tags: {
            some: { tag: { name: { contains: params.q, mode: "insensitive" } } },
          },
        },
      ];
    }

    if (params.category) {
      where.category = { slug: params.category };
    }

    if (params.tag) {
      where.tags = { some: { tag: { slug: params.tag } } };
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput =
      params.sort === "oldest"
        ? { publishedAt: "asc" }
        : { publishedAt: "desc" };

    const skip = (params.page - 1) * params.limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
        include: articleInclude,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },
};
