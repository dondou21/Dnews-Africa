import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), userController.getAll);
router.get("/:id", authenticate, userController.getById);
router.patch("/:id", authenticate, userController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), userController.delete);

export default router;
