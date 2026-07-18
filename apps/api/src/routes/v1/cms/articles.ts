import { Router } from "express";
import { articleController } from "../../../controllers/articleController";
import { commentController } from "../../../controllers/commentController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/", articleController.getAll);
router.get("/admin/all", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.getAllAdmin);
router.get("/admin/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.getById);
router.get("/featured", articleController.getFeatured);
router.get("/latest", articleController.getLatest);
router.get("/:slug", articleController.getBySlug);
router.post("/", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.create);
router.post("/:id/submit", authenticate, requireRole("Journalist"), articleController.submitForReview);
router.patch("/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.update);
router.delete("/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.delete);

router.get("/:id/comments", commentController.getByArticle);
router.post("/:id/comments", commentController.create);

export default router;
