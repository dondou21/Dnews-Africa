import { Router } from "express";
import { commentController } from "../controllers/commentController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN", "EDITOR", "MODERATOR"), commentController.getAll);
router.get("/pending", authenticate, requireRole("ADMIN", "EDITOR", "MODERATOR"), commentController.getPending);
router.patch("/:id", authenticate, requireRole("ADMIN", "EDITOR", "MODERATOR"), commentController.updateStatus);
router.delete("/:id", authenticate, requireRole("ADMIN", "EDITOR"), commentController.delete);

export default router;