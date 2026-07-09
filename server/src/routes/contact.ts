import { Router } from "express";
import { contactController } from "../controllers/contactController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { contactLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/", contactLimiter, contactController.create);
router.get("/messages", authenticate, requireRole("ADMIN", "EDITOR"), contactController.getAll);

export default router;
