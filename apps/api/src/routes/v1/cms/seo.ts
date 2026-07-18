import { Router } from "express";
import { seoController } from "../../../controllers/seoController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/sitemap.xml", seoController.getSitemap);
router.get("/news-sitemap.xml", seoController.getNewsSitemap);
router.get("/image-sitemap.xml", seoController.getImageSitemap);
router.get("/robots.txt", seoController.getRobotsTxt);

router.get("/seo/:entityType/:entityId", authenticate, requireRole("Admin", "Editor", "Journalist"), seoController.getSeo);
router.put("/seo/:entityType/:entityId", authenticate, requireRole("Admin", "Editor"), seoController.saveSeo);
router.delete("/seo/:entityType/:entityId", authenticate, requireRole("Admin"), seoController.deleteSeo);

router.post("/seo/analyze", authenticate, requireRole("Admin", "Editor", "Journalist"), seoController.analyzeSeo);

router.get("/articles/:id/seo", authenticate, requireRole("Admin", "Editor", "Journalist"), seoController.articleSeo);
router.put("/articles/:id/seo", authenticate, requireRole("Admin", "Editor"), seoController.saveArticleSeo);

router.get("/redirects", authenticate, requireRole("Admin", "Editor"), seoController.getRedirects);
router.post("/redirects", authenticate, requireRole("Admin"), seoController.createRedirect);
router.patch("/redirects/:id", authenticate, requireRole("Admin"), seoController.updateRedirect);
router.delete("/redirects/:id", authenticate, requireRole("Admin"), seoController.deleteRedirect);

router.get("/settings", authenticate, requireRole("Admin", "Editor"), seoController.getSettings);
router.put("/settings", authenticate, requireRole("Admin"), seoController.updateSettings);

router.get("/report", authenticate, requireRole("Admin", "Editor"), seoController.getReport);

export default router;
