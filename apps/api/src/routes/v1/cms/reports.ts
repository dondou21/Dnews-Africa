import { Router } from "express";
import { analyticsController } from "../../../controllers/analyticsController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();
router.use(authenticate);
router.get("/dashboard", requireRole("Admin"), analyticsController.getDashboard);
export default router;
