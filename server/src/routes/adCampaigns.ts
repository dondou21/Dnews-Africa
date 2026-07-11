import { Router } from "express";
import { adCampaignController } from "../controllers/adCampaignController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/", requireRole("Admin", "Editor", "Moderator"), adCampaignController.getAll);
router.get("/:id", requireRole("Admin", "Editor", "Moderator"), adCampaignController.getById);
router.post("/", requireRole("Admin"), adCampaignController.create);
router.put("/:id", requireRole("Admin"), adCampaignController.update);
router.delete("/:id", requireRole("Admin"), adCampaignController.delete);

export default router;
