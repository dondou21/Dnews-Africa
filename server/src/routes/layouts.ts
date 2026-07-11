import { Router } from "express";
import { layoutController } from "../controllers/layoutController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/published", layoutController.getPublished);
router.get("/slug/:slug", layoutController.getBySlug);

router.get("/", authenticate, requireRole("Admin", "Editor"), layoutController.getAll);
router.get("/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), layoutController.getById);
router.post("/", authenticate, requireRole("Admin", "Editor"), layoutController.create);
router.put("/:id", authenticate, requireRole("Admin", "Editor"), layoutController.update);
router.delete("/:id", authenticate, requireRole("Admin"), layoutController.delete);
router.post("/:id/publish", authenticate, requireRole("Admin", "Editor"), layoutController.publish);
router.post("/:id/duplicate", authenticate, requireRole("Admin", "Editor"), layoutController.duplicate);
router.put("/:id/sections", authenticate, requireRole("Admin", "Editor"), layoutController.saveSections);

export default router;
