import prisma from "../utils/prisma";
import { roleRepository } from "./roleRepository";

const now = new Date();
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

const recentArticleSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  createdAt: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  author: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
} as const;

export const dashboardRepository = {
  async getOverview() {
    const [
      articleStatusCounts,
      commentStatusCounts,
      contactMessageReadCounts,
      articlesPublishedToday,
      totalCategories,
      totalUsers,
      totalMediaFiles,
      totalNewsletterSubscribers,
    ] = await Promise.all([
      prisma.article.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.comment.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.contactMessage.groupBy({
        by: ["isRead"],
        _count: { _all: true },
      }),
      prisma.article.count({
        where: { status: "PUBLISHED", publishedAt: { gte: startOfToday } },
      }),
      prisma.category.count(),
      prisma.user.count(),
      prisma.media.count(),
      prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    ]);

    const countByStatus = (list: { status: string; _count: { _all: number | null } }[]) =>
      list.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count._all ?? 0;
        return acc;
      }, {});
    const articleCounts = countByStatus(articleStatusCounts);
    const commentCounts = countByStatus(commentStatusCounts);
    const contactReadCounts = contactMessageReadCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.isRead ? "read" : "unread"] = item._count._all ?? 0;
      return acc;
    }, {});
    const totalContactMessages =
      (contactReadCounts.read ?? 0) + (contactReadCounts.unread ?? 0);

    return {
      totalArticles: Object.values(articleCounts).reduce((a, b) => a + b, 0),
      publishedArticles: articleCounts.PUBLISHED ?? 0,
      draftArticles: articleCounts.DRAFT ?? 0,
      pendingReviewArticles: articleCounts.PENDING_REVIEW ?? 0,
      rejectedArticles: articleCounts.REJECTED ?? 0,
      archivedArticles: articleCounts.ARCHIVED ?? 0,
      scheduledArticles: articleCounts.SCHEDULED ?? 0,
      totalCategories,
      totalUsers,
      totalMediaFiles,
      totalNewsletterSubscribers,
      totalContactMessages,
      unreadContactMessages: contactReadCounts.unread ?? 0,
      totalComments: Object.values(commentCounts).reduce((a, b) => a + b, 0),
      pendingComments: commentCounts.PENDING ?? 0,
      approvedComments: commentCounts.APPROVED ?? 0,
      rejectedComments: commentCounts.REJECTED ?? 0,
      spamComments: 0,
      articlesPublishedToday,
    };
  },

  async getArticleStats() {
    const [articlesPublishedThisMonth, featuredArticlesCount] = await Promise.all([
      prisma.article.count({
        where: { status: "PUBLISHED", publishedAt: { gte: startOfMonth } },
      }),
      prisma.article.count({ where: { isFeatured: true, status: "PUBLISHED" } }),
    ]);

    return {
      articlesPublishedThisMonth,
      featuredArticlesCount,
    };
  },

  async getUserStats() {
    const roles = await roleRepository.findAll();
    const roleIds = roles.map((r) => r.id);

    const roleIdCounts = roleIds.length
      ? await prisma.user.groupBy({
          by: ["roleId"],
          _count: { _all: true },
        })
      : [];

    const countByRoleId = roleIdCounts.reduce<Record<number, number>>((acc, item) => {
      acc[item.roleId] = item._count._all;
      return acc;
    }, {});

    const roleName = (name: string) => {
      const role = roles.find((r) => r.name === name);
      return role ? (countByRoleId[role.id] ?? 0) : 0;
    };

    return {
      totalJournalists: roleName("Journalist"),
      totalEditors: roleName("Editor"),
      totalAdmins: roleName("Admin"),
    };
  },

  async getRecentArticles() {
    return prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: recentArticleSelect,
    });
  },

  async getRecentPendingArticles() {
    return prisma.article.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: recentArticleSelect,
    });
  },
};