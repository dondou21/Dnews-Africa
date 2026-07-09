import { Router } from "express";
import { contactController } from "../controllers/contactController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { contactLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/", contactLimiter, contactController.create);
router.get("/messages", authenticate, requireRole("ADMIN", "EDITOR"), contactController.getAll);
router.patch("/messages/:id/read", authenticate, requireRole("ADMIN", "EDITOR"), contactController.markAsRead);
router.delete("/messages/:id", authenticate, requireRole("ADMIN", "EDITOR"), contactController.delete);

export default router;
