import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { validateSlug } from "../middlewares/validateSlug";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:slug", validateSlug, categoryController.getBySlug);
router.get("/:slug/articles", validateSlug, categoryController.getArticlesBySlug);

router.post("/", authenticate, requireRole("Admin", "Editor"), categoryController.create);
router.patch("/:id", authenticate, requireRole("Admin", "Editor"), categoryController.update);
router.delete("/:id", authenticate, requireRole("Admin", "Editor"), categoryController.delete);

export default router;
