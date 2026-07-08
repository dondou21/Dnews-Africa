import { Router } from "express";
import { articleController } from "../controllers/articleController";
import { commentController } from "../controllers/commentController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", articleController.getAll);
router.get("/featured", articleController.getFeatured);
router.get("/latest", articleController.getLatest);
router.get("/:slug", articleController.getBySlug);
router.post("/", authenticate, requireRole("ADMIN", "EDITOR", "JOURNALIST"), articleController.create);
router.patch("/:id", authenticate, requireRole("ADMIN", "EDITOR", "JOURNALIST"), articleController.update);
router.delete("/:id", authenticate, requireRole("ADMIN", "EDITOR"), articleController.delete);

router.get("/:id/comments", commentController.getByArticle);
router.post("/:id/comments", commentController.create);

export default router;
