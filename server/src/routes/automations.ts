import { Router } from "express";
import { automationController } from "../controllers/automationController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/", automationController.getAll);
router.get("/:id", automationController.getById);

router.post("/", requireRole("Admin"), automationController.create);
router.put("/:id", requireRole("Admin"), automationController.update);
router.delete("/:id", requireRole("Admin"), automationController.delete);
router.post("/:id/run", requireRole("Admin"), automationController.run);

export default router;
