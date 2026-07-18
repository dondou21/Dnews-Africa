import { dashboardRepository } from "../repositories/dashboardRepository";

export const dashboardService = {
  async getStats() {
    const [overview, articleStats, userStats, recentArticles, recentPendingArticles] =
      await Promise.all([
        dashboardRepository.getOverview(),
        dashboardRepository.getArticleStats(),
        dashboardRepository.getUserStats(),
        dashboardRepository.getRecentArticles(),
        dashboardRepository.getRecentPendingArticles(),
      ]);

    return {
      overview: {
        ...overview,
        articlesPublishedThisMonth: articleStats.articlesPublishedThisMonth,
        featuredArticlesCount: articleStats.featuredArticlesCount,
      },
      users: {
        totalUsers: overview.totalUsers,
        totalAdmins: userStats.totalAdmins,
        totalEditors: userStats.totalEditors,
        totalJournalists: userStats.totalJournalists,
      },
      articles: {
        totalArticles: overview.totalArticles,
        publishedArticles: overview.publishedArticles,
        draftArticles: overview.draftArticles,
        pendingReviewArticles: overview.pendingReviewArticles,
        rejectedArticles: overview.rejectedArticles,
        archivedArticles: overview.archivedArticles,
        scheduledArticles: overview.scheduledArticles,
        articlesPublishedToday: overview.articlesPublishedToday,
        articlesPublishedThisMonth: articleStats.articlesPublishedThisMonth,
        featuredArticlesCount: articleStats.featuredArticlesCount,
      },
      comments: {
        totalComments: overview.totalComments,
        pendingComments: overview.pendingComments,
        approvedComments: overview.approvedComments,
        rejectedComments: overview.rejectedComments,
        spamComments: overview.spamComments,
      },
      newsletter: {
        totalSubscribers: overview.totalNewsletterSubscribers,
      },
      contact: {
        totalMessages: overview.totalContactMessages,
        unreadMessages: overview.unreadContactMessages,
      },
      media: {
        totalFiles: overview.totalMediaFiles,
      },
      categories: {
        totalCategories: overview.totalCategories,
      },
      recentActivity: {
        recentArticles,
        recentPendingArticles,
      },
    };
  },
};