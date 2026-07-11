import { analyticsRepository } from "../repositories/analyticsRepository";

export const analyticsService = {
  async getDashboard(period: string, startDate?: string, endDate?: string) {
    const [dashboard, trafficSources, topArticles, trending, realtime] = await Promise.all([
      analyticsRepository.getDashboard(period, startDate, endDate),
      analyticsRepository.getTrafficSources(period, startDate, endDate),
      analyticsRepository.getTopArticles(period, 10, startDate, endDate),
      analyticsRepository.getTrendingArticles(5),
      analyticsRepository.getRealtime(),
    ]);
    return { ...dashboard, trafficSources, topArticles, trending, realtime };
  },

  async getTrafficSources(period: string, startDate?: string, endDate?: string) {
    return analyticsRepository.getTrafficSources(period, startDate, endDate);
  },

  async getTopArticles(period: string, limit = 10, startDate?: string, endDate?: string) {
    return analyticsRepository.getTopArticles(period, limit, startDate, endDate);
  },

  async getArticleAnalytics(articleId: string, period: string, startDate?: string, endDate?: string) {
    const [analytics] = await Promise.all([
      analyticsRepository.getArticleAnalytics(articleId, period, startDate, endDate),
    ]);
    return analytics;
  },

  async getAuthorAnalytics(authorId: string, period: string, startDate?: string, endDate?: string) {
    return analyticsRepository.getAuthorAnalytics(authorId, period, startDate, endDate);
  },

  async getCategoryAnalytics(categoryId: number, period: string, startDate?: string, endDate?: string) {
    return analyticsRepository.getCategoryAnalytics(categoryId, period, startDate, endDate);
  },

  async getSearchAnalytics(period: string, startDate?: string, endDate?: string) {
    return analyticsRepository.getSearchAnalytics(period, startDate, endDate);
  },

  async getRealtime() {
    return analyticsRepository.getRealtime();
  },

  async getHomepageAnalytics(period: string, startDate?: string, endDate?: string) {
    return analyticsRepository.getHomepageAnalytics(period, startDate, endDate);
  },

  async getTrendingArticles(limit = 10) {
    return analyticsRepository.getTrendingArticles(limit);
  },
};
