import { Router } from "express";
import { trackingController } from "../controllers/trackingController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/dashboard", requireRole("Admin"), trackingController.getDashboardAnalytics);
router.get("/campaigns/:id", requireRole("Admin", "Editor"), trackingController.getCampaignAnalytics);

export default router;
