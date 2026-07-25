import { Router } from "express";
import { newsletterController } from "../../../controllers/newsletterController";
import { authenticate } from "../../../middlewares/auth";
import { authorize } from "../../../middlewares/authorize";

const router = Router();

router.use(authenticate);
router.use(authorize("Admin", "Editor"));

router.get("/", newsletterController.getAll);
router.get("/stats", newsletterController.getStats);
router.get("/:id", newsletterController.getById);
router.patch("/:id", newsletterController.update);
router.delete("/:id", newsletterController.delete);
router.post("/:id/resend-confirmation", newsletterController.resendConfirmation);

export default router;
