import { Router } from "express";
import { newsletterController } from "../../../controllers/newsletterController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.post("/test-send", requireRole("Admin"), newsletterController.sendTestNewsletter);

export default router;
