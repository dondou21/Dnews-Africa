import { Router } from "express";
import { articleController } from "../../../controllers/articleController";
import { commentController } from "../../../controllers/commentController";

const router = Router();

router.get("/", articleController.getAll);
router.get("/featured", articleController.getFeatured);
router.get("/latest", articleController.getLatest);
router.get("/:slug", articleController.getBySlug);
router.get("/:id/comments", commentController.getByArticle);
router.post("/:id/comments", commentController.create);

export default router;
