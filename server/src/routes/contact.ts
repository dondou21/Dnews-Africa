import { Router } from "express";
import { contactController } from "../controllers/contactController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.post("/", contactController.create);
router.get("/messages", authenticate, requireRole("ADMIN", "EDITOR"), contactController.getAll);

export default router;
