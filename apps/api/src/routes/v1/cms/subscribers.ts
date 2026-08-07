import { Router } from "express";
import { newsletterController } from "../../../controllers/newsletterController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.use(authenticate);
router.use(requireRole("Admin", "Editor"));

router.get("/", newsletterController.getAll);
router.post("/", newsletterController.createSubscriber);
router.get("/stats", newsletterController.getStats);
router.get("/:id", newsletterController.getById);
router.patch("/:id", newsletterController.update);
router.delete("/:id", newsletterController.delete);
router.post("/:id/resend-confirmation", newsletterController.resendConfirmation);

export default router;
