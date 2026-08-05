import { Router } from "express";
import { sponsorController } from "../../../controllers/sponsorController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/", authenticate, requireRole("Admin", "Editor", "Journalist"), sponsorController.getAll);
router.get("/:id", authenticate, requireRole("Admin", "Editor", "Journalist"), sponsorController.getById);
router.post("/", authenticate, requireRole("Admin", "Editor"), sponsorController.create);
router.patch("/:id", authenticate, requireRole("Admin", "Editor"), sponsorController.update);
router.delete("/:id", authenticate, requireRole("Admin", "Editor"), sponsorController.delete);

export default router;
