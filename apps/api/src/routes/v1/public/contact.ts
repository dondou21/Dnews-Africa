import { Router } from "express";
import { contactController } from "../../../controllers/contactController";
import { contactLimiter } from "../../../middlewares/rateLimit";

const router = Router();

router.post("/", contactLimiter, contactController.create);

export default router;
