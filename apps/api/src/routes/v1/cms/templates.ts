import { Router } from "express";
import { templateController } from "../../../controllers/templateController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/", templateController.getAll);
router.get("/:id", templateController.getById);

router.post("/", requireRole("Admin", "Editor"), templateController.create);
router.put("/:id", requireRole("Admin", "Editor"), templateController.update);
router.delete("/:id", requireRole("Admin"), templateController.delete);
router.post("/:id/duplicate", requireRole("Admin", "Editor"), templateController.duplicate);

export default router;
