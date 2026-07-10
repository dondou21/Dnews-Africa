import { Router } from "express";
import { newsletterController } from "../controllers/newsletterController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { newsletterLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/subscribe", newsletterLimiter, newsletterController.subscribe);
router.get("/subscribers", authenticate, requireRole("Admin", "Editor"), newsletterController.getAll);
router.delete("/subscribers/:id", authenticate, requireRole("Admin", "Editor"), newsletterController.unsubscribe);

export default router;
