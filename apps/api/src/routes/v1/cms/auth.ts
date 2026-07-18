import { Router } from "express";
import { authController } from "../../../controllers/authController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { authLimiter } from "../../../middlewares/rateLimit";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/me", authenticate, authController.me);
router.patch("/password", authenticate, authController.changePassword);

export default router;
