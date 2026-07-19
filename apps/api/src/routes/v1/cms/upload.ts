import { Router } from "express";
import { uploadController } from "../../../controllers/uploadController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";
import { uploadMiddleware } from "../../../middlewares/uploadMiddleware";
import { uploadLimiter } from "../../../middlewares/rateLimit";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("Admin", "Editor", "Journalist"),
  uploadLimiter,
  uploadMiddleware,
  uploadController.upload
);

router.delete(
  "/:publicId",
  authenticate,
  requireRole("Admin", "Editor"),
  uploadController.delete
);

export default router;
