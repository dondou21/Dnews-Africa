import prisma from "../utils/prisma";

const commentInclude = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
} as const;

export const commentRepository = {
  findApprovedByArticleId: (articleId: string) =>
    prisma.comment.findMany({
      where: { articleId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: commentInclude,
    }),

  findById: (id: string) =>
    prisma.comment.findUnique({
      where: { id },
      include: commentInclude,
    }),

  findAll: () =>
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ...commentInclude,
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),

  findPending: () =>
    prisma.comment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        ...commentInclude,
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),

  create: (data: {
    content: string;
    articleId: string;
    authorId?: string;
    guestName?: string;
    guestEmail?: string;
  }) =>
    prisma.comment.create({
      data,
      include: commentInclude,
    }),

  updateStatus: (id: string, status: string) =>
    prisma.comment.update({
      where: { id },
      data: { status: status as any },
      include: commentInclude,
    }),

  delete: (id: string) =>
    prisma.comment.delete({ where: { id } }),
};