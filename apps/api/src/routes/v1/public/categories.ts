import { Router } from "express";
import { categoryController } from "../../../controllers/categoryController";
import { validateSlug } from "../../../middlewares/validateSlug";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:slug", validateSlug, categoryController.getBySlug);
router.get("/:slug/articles", validateSlug, categoryController.getArticlesBySlug);

export default router;
