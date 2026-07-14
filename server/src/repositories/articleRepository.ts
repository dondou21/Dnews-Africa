import { Prisma, $Enums } from "@prisma/client";
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
  featuredImage: {
    select: { id: true, url: true, alt: true },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

export interface ArticleQueryParams {
  category?: string;
  tag?: string;
  search?: string;
  page: number;
  limit: number;
  sort: string;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featuredImageId?: string;
  categoryId: number;
  authorId?: string;
  status?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  tags?: string[];
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featuredImageId?: string;
  categoryId?: number;
  authorId?: string;
  status?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  tags?: string[];
}

function mapTagSlugsToIds(slugs: string[]) {
  return Promise.all(
    slugs.map(async (slug) => {
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name: slug.replace(/-/g, " "), slug },
      });
      return tag.id;
    })
  );
}

export const articleRepository = {
  async findAllPublished(params: ArticleQueryParams) {
    const where: Prisma.ArticleWhereInput = { status: "PUBLISHED" };

    if (params.category) {
      where.category = { slug: params.category };
    }

    if (params.tag) {
      where.tags = { some: { tag: { slug: params.tag } } };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
      params.sort === "oldest"
        ? [{ publishedAt: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }]
        : params.sort === "title_asc"
          ? [{ title: "asc" }]
          : params.sort === "title_desc"
            ? [{ title: "desc" }]
            : [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];

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

  async findPublishedBySlug(slug: string) {
    return prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        ...articleInclude,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
  },

  async findAllAdmin(params: ArticleQueryParams & { status?: string }) {
    const where: Prisma.ArticleWhereInput = {};

    if (params.status && params.status !== "ALL") {
      where.status = params.status as $Enums.ArticleStatus;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
      params.sort === "oldest"
        ? [{ createdAt: "asc" }, { publishedAt: { sort: "asc", nulls: "last" } }]
        : params.sort === "title_asc"
          ? [{ title: "asc" }]
          : params.sort === "title_desc"
            ? [{ title: "desc" }]
            : [{ createdAt: "desc" }, { publishedAt: { sort: "desc", nulls: "last" } }];

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

  async findById(id: string) {
    return prisma.article.findUnique({ where: { id } });
  },

  async findByIdWithDetails(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: articleInclude,
    });
  },

  async findAllByAuthor(authorId: string, params: ArticleQueryParams & { status?: string }) {
    const where: Prisma.ArticleWhereInput = { authorId };

    if (params.status && params.status !== "ALL") {
      where.status = params.status as $Enums.ArticleStatus;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
      params.sort === "oldest"
        ? [{ createdAt: "asc" }, { publishedAt: { sort: "asc", nulls: "last" } }]
        : params.sort === "title_asc"
          ? [{ title: "asc" }]
          : params.sort === "title_desc"
            ? [{ title: "desc" }]
            : [{ createdAt: "desc" }, { publishedAt: { sort: "desc", nulls: "last" } }];

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

  async findFeatured() {
    return prisma.article.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
      include: articleInclude,
    });
  },

  async findLatest(limit: number = 10) {
    return prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: articleInclude,
    });
  },

  async create(data: CreateArticleInput) {
    const { tags, ...articleFields } = data;

    let publishedAt: Date | undefined;
    if (articleFields.publishedAt) {
      publishedAt = new Date(articleFields.publishedAt);
    } else if (articleFields.status === "PUBLISHED") {
      publishedAt = new Date();
    }

    const tagIds = tags?.length ? await mapTagSlugsToIds(tags) : [];

    return prisma.article.create({
      data: {
        title: articleFields.title,
        slug: articleFields.slug,
        summary: articleFields.summary,
        content: articleFields.content,
        coverImageUrl: articleFields.coverImageUrl,
        coverImageAlt: articleFields.coverImageAlt,
        featuredImageId: articleFields.featuredImageId,
        categoryId: articleFields.categoryId,
        authorId: articleFields.authorId!,
        status: articleFields.status as $Enums.ArticleStatus,
        isFeatured: articleFields.isFeatured,
        isTrending: articleFields.isTrending,
        publishedAt,
        tags: tagIds.length
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: articleInclude,
    });
  },

  async update(id: string, data: UpdateArticleInput) {
    const { tags, ...articleFields } = data;

    let publishedAt: Date | undefined;
    if (articleFields.publishedAt) {
      publishedAt = new Date(articleFields.publishedAt);
    } else if (articleFields.status === "PUBLISHED") {
      publishedAt = new Date();
    }

    if (tags) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });

      const tagIds = await mapTagSlugsToIds(tags);
      if (tagIds.length) {
        await prisma.articleTag.createMany({
          data: tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
    }

    return prisma.article.update({
      where: { id },
      data: {
        ...articleFields as Prisma.ArticleUpdateInput,
        publishedAt,
      },
      include: articleInclude,
    });
  },

  async delete(id: string) {
    return prisma.article.delete({ where: { id } });
  },
};
