import prisma from "../utils/prisma";

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
      totalArticles,
      publishedArticles,
      draftArticles,
      pendingReviewArticles,
      rejectedArticles,
      archivedArticles,
      totalCategories,
      totalUsers,
      totalMediaFiles,
      totalNewsletterSubscribers,
      totalContactMessages,
      unreadContactMessages,
      totalComments,
      pendingComments,
      approvedComments,
      rejectedComments,
      articlesPublishedToday,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.article.count({ where: { status: "REJECTED" } }),
      prisma.article.count({ where: { status: "ARCHIVED" } }),
      prisma.category.count(),
      prisma.user.count(),
      prisma.media.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.comment.count({ where: { status: "APPROVED" } }),
      prisma.comment.count({ where: { status: "REJECTED" } }),
      prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: startOfToday } } }),
    ]);

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      pendingReviewArticles,
      rejectedArticles,
      archivedArticles,
      totalCategories,
      totalUsers,
      totalMediaFiles,
      totalNewsletterSubscribers,
      totalContactMessages,
      unreadContactMessages,
      totalComments,
      pendingComments,
      approvedComments,
      rejectedComments,
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
    const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
    const journalistRole = await prisma.role.findUnique({ where: { name: "Journalist" } });
    const editorRole = await prisma.role.findUnique({ where: { name: "Editor" } });

    const [totalJournalists, totalEditors, totalAdmins] = await Promise.all([
      journalistRole ? prisma.user.count({ where: { roleId: journalistRole.id } }) : 0,
      editorRole ? prisma.user.count({ where: { roleId: editorRole.id } }) : 0,
      adminRole ? prisma.user.count({ where: { roleId: adminRole.id } }) : 0,
    ]);

    return { totalJournalists, totalEditors, totalAdmins };
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