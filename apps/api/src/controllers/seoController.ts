import { Request, Response, NextFunction } from "express";
import { seoService } from "../services/seoService";
import { sitemapService } from "../services/sitemapService";
import { AppError } from "../middlewares/errorHandler";
import { seoMetadataSchema, redirectSchema, updateRedirectSchema, seoSettingsSchema } from "../validators/seoValidator";

export const seoController = {
  async getSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const seo = await seoService.getSeo(entityType, entityId);
      res.json({ status: "success", data: seo ?? {} });
    } catch (error) { next(error); }
  },

  async saveSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const parsed = seoMetadataSchema.parse(req.body);
      const clean = Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== undefined));
      const seo = await seoService.saveSeo(entityType, entityId, clean);
      res.json({ status: "success", data: seo });
    } catch (error) { next(error); }
  },

  async deleteSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      await seoService.deleteSeo(entityType, entityId);
      res.json({ status: "success", data: null });
    } catch (error) { next(error); }
  },

  async analyzeSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = seoService.analyzeSeo(req.body);
      res.json({ status: "success", data: result });
    } catch (error) { next(error); }
  },

  async getRedirects(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await seoService.getRedirects(page, limit, search);
      res.json({ status: "success", data: result });
    } catch (error) { next(error); }
  },

  async createRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = redirectSchema.parse(req.body);
      const redirect = await seoService.createRedirect({ ...parsed, note: parsed.note ?? undefined });
      res.status(201).json({ status: "success", data: redirect });
    } catch (error) { next(error); }
  },

  async updateRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateRedirectSchema.parse(req.body);
      const redirect = await seoService.updateRedirect(id, parsed);
      res.json({ status: "success", data: redirect });
    } catch (error) { next(error); }
  },

  async deleteRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await seoService.deleteRedirect(id);
      res.json({ status: "success", data: null });
    } catch (error) { next(error); }
  },

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await seoService.getSettings();
      res.json({ status: "success", data: settings });
    } catch (error) { next(error); }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = seoSettingsSchema.parse(req.body);
      const settings = await seoService.updateSettings(parsed);
      res.json({ status: "success", data: settings });
    } catch (error) { next(error); }
  },

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await seoService.getReport();
      res.json({ status: "success", data: report });
    } catch (error) { next(error); }
  },

  async getSitemap(_req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = `${_req.protocol}://${_req.get("host")}`;
      const sitemap = await sitemapService.generateMainSitemap(baseUrl);
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) { next(error); }
  },

  async getNewsSitemap(_req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = `${_req.protocol}://${_req.get("host")}`;
      const sitemap = await sitemapService.generateNewsSitemap(baseUrl);
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) { next(error); }
  },

  async getImageSitemap(_req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = `${_req.protocol}://${_req.get("host")}`;
      const sitemap = await sitemapService.generateImageSitemap(baseUrl);
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) { next(error); }
  },

  async getRobotsTxt(_req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = `${_req.protocol}://${_req.get("host")}`;
      const robots = await sitemapService.generateRobotsTxt(baseUrl);
      res.header("Content-Type", "text/plain");
      res.send(robots);
    } catch (error) { next(error); }
  },

  async resolveRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const redirect = await (await import("../repositories/seoRepository")).seoRepository.getRedirectByFromPath(`/articles/${slug}`);
      if (!redirect) throw new AppError("Not found", 404);
      res.redirect(redirect.statusCode, redirect.toPath);
    } catch (error) { next(error); }
  },

  async articleSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const seo = await seoService.getSeo("article", id);
      res.json({ status: "success", data: seo ?? {} });
    } catch (error) { next(error); }
  },

  async saveArticleSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = seoMetadataSchema.parse(req.body);
      const clean = Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== undefined));
      const seo = await seoService.saveSeo("article", id, clean);
      res.json({ status: "success", data: seo });
    } catch (error) { next(error); }
  },
};
