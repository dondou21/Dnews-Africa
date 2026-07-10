import { Router } from "express";
import { settingsController } from "../controllers/settingsController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/", requireRole("Admin"), settingsController.get);
router.put("/", requireRole("Admin"), settingsController.update);

export default router;
