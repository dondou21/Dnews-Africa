import { Router } from "express";
import { trackingController } from "../controllers/trackingController";

const router = Router();

router.get("/open/:campaignId/:subscriberId", trackingController.trackOpen);
router.get("/click/:campaignId/:subscriberId", trackingController.trackClick);

export default router;
