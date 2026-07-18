import { Router } from "express";
import { userController } from "../../../controllers/userController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.get("/", authenticate, requireRole("Admin"), userController.getAll);
router.get("/authors", authenticate, requireRole("Admin", "Editor", "Journalist"), userController.getAuthors);
router.post("/", authenticate, requireRole("Admin"), userController.createByAdmin);
router.get("/:id", authenticate, userController.getById);
router.patch("/:id", authenticate, userController.update);
router.delete("/:id", authenticate, requireRole("Admin"), userController.delete);

export default router;
