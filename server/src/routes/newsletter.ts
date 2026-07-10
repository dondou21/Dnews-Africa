import { Router } from "express";
import { newsletterController } from "../controllers/newsletterController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { newsletterLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/subscribe", newsletterLimiter, newsletterController.subscribe);
router.get("/verify", newsletterController.verify);
router.post("/unsubscribe", newsletterLimiter, newsletterController.unsubscribe);

router.get("/subscribers", authenticate, requireRole("Admin"), newsletterController.getAll);
router.get("/subscribers/stats", authenticate, requireRole("Admin"), newsletterController.getStats);
router.get("/subscribers/:id", authenticate, requireRole("Admin"), newsletterController.getById);
router.patch("/subscribers/:id", authenticate, requireRole("Admin"), newsletterController.update);
router.delete("/subscribers/:id", authenticate, requireRole("Admin"), newsletterController.delete);

export default router;
