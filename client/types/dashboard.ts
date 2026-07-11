export interface DashboardStats {
  overview: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    pendingReviewArticles: number;
    rejectedArticles: number;
    archivedArticles: number;
    totalCategories: number;
    totalUsers: number;
    totalMediaFiles: number;
    newsletterSubscribers: number;
    totalContactMessages: number;
    unreadContactMessages: number;
    articlesPublishedToday: number;
    articlesPublishedThisMonth: number;
    featuredArticlesCount: number;
  };
  users: {
    totalUsers: number;
    totalAdmins: number;
    totalEditors: number;
    totalJournalists: number;
  };
  articles: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    pendingReviewArticles: number;
    rejectedArticles: number;
    archivedArticles: number;
    articlesPublishedToday: number;
    articlesPublishedThisMonth: number;
    featuredArticlesCount: number;
  };
  newsletter: {
    totalSubscribers: number;
  };
  contact: {
    totalMessages: number;
    unreadMessages: number;
  };
  media: {
    totalFiles: number;
  };
  categories: {
    totalCategories: number;
  };
}
