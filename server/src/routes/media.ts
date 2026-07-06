import { Router } from "express";
import { mediaController } from "../controllers/mediaController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/upload", authenticate, requireRole("ADMIN", "EDITOR", "JOURNALIST"), uploadMiddleware, mediaController.upload);
router.get("/", authenticate, mediaController.getAll);
router.get("/:id", authenticate, mediaController.getById);
router.delete("/:id", authenticate, requireRole("ADMIN", "EDITOR"), mediaController.delete);

export default router;
