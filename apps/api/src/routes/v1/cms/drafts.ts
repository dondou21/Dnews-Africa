import { Router } from "express";
import { draftController } from "../../../controllers/draftController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/:formKey", authenticate, requireRole("Admin", "Editor", "Journalist"), draftController.getDraft);
router.put("/:formKey", authenticate, requireRole("Admin", "Editor", "Journalist"), draftController.saveDraft);
router.delete("/:formKey", authenticate, requireRole("Admin", "Editor", "Journalist"), draftController.deleteDraft);

export default router;
