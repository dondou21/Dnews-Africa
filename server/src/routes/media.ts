import { Router } from "express";
import { mediaController } from "../controllers/mediaController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { uploadLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/upload", authenticate, requireRole("Admin", "Editor", "Journalist"), uploadLimiter, uploadMiddleware, mediaController.upload);
router.get("/", authenticate, mediaController.getAll);
router.get("/:id", authenticate, mediaController.getById);
router.delete("/:id", authenticate, requireRole("Admin", "Editor"), mediaController.delete);

export default router;
