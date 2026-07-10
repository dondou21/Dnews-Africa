import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", authenticate, requireRole("Admin", "Editor", "Moderator"), dashboardController.getStats);

export default router;