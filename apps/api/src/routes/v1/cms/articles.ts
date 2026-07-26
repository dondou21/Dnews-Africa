import { Router } from "express";
import { articleController } from "../../../controllers/articleController";
import { articleNewsletterController } from "../../../controllers/articleNewsletterController";
import { commentController } from "../../../controllers/commentController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/", articleController.getAll);
router.get("/admin/all", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.getAllAdmin);
router.get("/admin/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.getById);
router.get("/featured", articleController.getFeatured);
router.get("/latest", articleController.getLatest);
router.get("/newsletter/deliveries", authenticate, requireRole("Admin", "Editor"), articleNewsletterController.listDeliveries);
router.get("/:slug", articleController.getBySlug);
router.post("/", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.create);
router.post("/:id/submit", authenticate, requireRole("Journalist"), articleController.submitForReview);
router.patch("/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.update);
router.delete("/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), articleController.delete);

router.get("/:id/comments", commentController.getByArticle);
router.post("/:id/comments", commentController.create);

router.post("/:id/newsletter/test", authenticate, requireRole("Admin", "Editor"), articleNewsletterController.sendTest);
router.get("/:id/newsletter/preview", authenticate, requireRole("Admin", "Editor", "Journalist"), articleNewsletterController.preview);
router.get("/:id/newsletter/delivery", authenticate, requireRole("Admin", "Editor"), articleNewsletterController.getDelivery);

export default router;
