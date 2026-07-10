import { Router } from "express";
import { campaignController } from "../controllers/campaignController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/", campaignController.getAll);
router.get("/stats", campaignController.getStats);
router.get("/:id", campaignController.getById);

router.post("/", requireRole("Admin", "Editor"), campaignController.create);
router.put("/:id", requireRole("Admin", "Editor"), campaignController.update);
router.delete("/:id", requireRole("Admin", "Editor"), campaignController.delete);

router.post("/:id/send", requireRole("Admin"), campaignController.send);
router.post("/:id/schedule", requireRole("Admin"), campaignController.schedule);
router.post("/:id/cancel", requireRole("Admin"), campaignController.cancel);

export default router;
