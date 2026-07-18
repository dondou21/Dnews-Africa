import { Router } from "express";
import { analyticsController } from "../../../controllers/analyticsController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/dashboard", requireRole("Admin", "Editor", "Journalist", "Moderator"), analyticsController.getDashboard);
router.get("/traffic", requireRole("Admin", "Editor"), analyticsController.getTrafficSources);
router.get("/articles/top", requireRole("Admin", "Editor", "Journalist"), analyticsController.getTopArticles);
router.get("/articles/:articleId", requireRole("Admin", "Editor", "Journalist"), analyticsController.getArticleAnalytics);
router.get("/authors/:authorId", requireRole("Admin", "Editor", "Journalist"), analyticsController.getAuthorAnalytics);
router.get("/categories/:categoryId", requireRole("Admin", "Editor"), analyticsController.getCategoryAnalytics);
router.get("/search", requireRole("Admin", "Editor"), analyticsController.getSearchAnalytics);
router.get("/realtime", requireRole("Admin", "Editor", "Journalist"), analyticsController.getRealtime);
router.get("/homepage", requireRole("Admin", "Editor"), analyticsController.getHomepageAnalytics);
router.get("/trending", requireRole("Admin", "Editor", "Journalist"), analyticsController.getTrendingArticles);

router.post("/reports/generate", requireRole("Admin", "Editor"), analyticsController.getReport);
router.post("/reports/export", requireRole("Admin", "Editor"), analyticsController.exportData);
router.get("/reports/exports", requireRole("Admin", "Editor"), analyticsController.getExports);

export default router;
