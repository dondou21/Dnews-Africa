import { Router } from "express";
import { advertisementController } from "../controllers/advertisementController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/public/:placement", advertisementController.publicServe);

router.use(authenticate);

router.get("/", requireRole("Admin", "Editor", "Moderator"), advertisementController.getAll);
router.get("/stats", requireRole("Admin"), advertisementController.getStats);
router.get("/:id", requireRole("Admin", "Editor", "Moderator"), advertisementController.getById);
router.post("/", requireRole("Admin"), advertisementController.create);
router.put("/:id", requireRole("Admin"), advertisementController.update);
router.delete("/:id", requireRole("Admin"), advertisementController.delete);

router.post("/:id/impression", advertisementController.trackImpression);
router.get("/:id/click", advertisementController.trackClick);

export default router;
