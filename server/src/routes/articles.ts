import { Router } from "express";
import { articleController } from "../controllers/articleController";

const router = Router();

router.get("/", articleController.getAll);
router.get("/featured", articleController.getFeatured);
router.get("/latest", articleController.getLatest);
router.get("/:slug", articleController.getBySlug);
router.post("/", articleController.create);
router.patch("/:id", articleController.update);
router.delete("/:id", articleController.delete);

export default router;
