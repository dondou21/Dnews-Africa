import { Router } from "express";
import { tagController } from "../../../controllers/tagController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/", tagController.getAll);
router.get("/:id", tagController.getById);
router.post("/", authenticate, requireRole("Admin", "Editor"), tagController.create);
router.patch("/:id", authenticate, requireRole("Admin", "Editor"), tagController.update);
router.delete("/:id", authenticate, requireRole("Admin", "Editor"), tagController.delete);

export default router;
