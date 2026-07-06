import { Router } from "express";
import { newsletterController } from "../controllers/newsletterController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.post("/subscribe", newsletterController.subscribe);
router.get("/subscribers", authenticate, requireRole("ADMIN", "EDITOR"), newsletterController.getAll);
router.delete("/subscribers/:id", authenticate, requireRole("ADMIN", "EDITOR"), newsletterController.unsubscribe);

export default router;
