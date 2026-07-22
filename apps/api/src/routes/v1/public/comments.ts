import { Router } from "express";
import { commentController } from "../../../controllers/commentController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/", commentController.getAll);
router.get("/pending", authenticate, requireRole("Admin", "Editor", "Moderator"), commentController.getPending);
router.get("/:id", commentController.getById);
router.patch("/:id", authenticate, requireRole("Admin", "Editor", "Moderator"), commentController.updateStatus);
router.delete("/:id", authenticate, requireRole("Admin", "Editor", "Moderator"), commentController.delete);

export default router;
