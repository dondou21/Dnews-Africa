import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analyticsService";
import { reportsService } from "../services/reportsService";
import { dashboardQuerySchema, analyticsQuerySchema, exportSchema } from "../validators/analyticsValidator";

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getDashboard(period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getTrafficSources(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getTrafficSources(period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getTopArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await analyticsService.getTopArticles(period, limit, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getArticleAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { articleId } = req.params;
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getArticleAnalytics(articleId, period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getAuthorAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorId } = req.params;
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getAuthorAnalytics(authorId, period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getCategoryAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getCategoryAnalytics(categoryId, period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getSearchAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getSearchAnalytics(period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getRealtime(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getRealtime();
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getHomepageAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, startDate, endDate } = dashboardQuerySchema.parse(req.query);
      const data = await analyticsService.getHomepageAnalytics(period, startDate, endDate);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getTrendingArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await analyticsService.getTrendingArticles(limit);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { exportType, periodStart, periodEnd, filters } = exportSchema.parse(req.body);
      const data = await reportsService.generateReport(exportType, periodStart, periodEnd, filters);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = exportSchema.parse(req.body);
      const data = await reportsService.requestExport({ ...parsed, userId: req.user!.id });
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async getExports(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportsService.getExports(req.user!.id);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },
};
