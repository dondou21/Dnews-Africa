import { Router } from "express";
import { newsletterController } from "../../../controllers/newsletterController";
import { newsletterLimiter } from "../../../middlewares/rateLimit";

const router = Router();

router.post("/subscribe", newsletterLimiter, newsletterController.subscribe);
router.get("/verify", newsletterController.verify);
router.post("/unsubscribe", newsletterController.unsubscribe);
router.get("/unsubscribe", newsletterController.unsubscribeByToken);
router.post("/resubscribe", newsletterController.resubscribe);

export default router;
