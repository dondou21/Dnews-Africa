import { Router } from "express";
import { trackingController } from "../controllers/trackingController";

const router = Router();

// All tracking endpoints are public (no auth required)
router.post("/pageview", trackingController.trackPageView);
router.post("/event", trackingController.trackEvent);
router.post("/session", trackingController.trackSession);
router.post("/search", trackingController.trackSearch);
router.post("/session/end", trackingController.endSession);

export default router;
