import { Router } from "express";
import { advertiserController } from "../../../controllers/advertiserController";
import { authenticate } from "../../../middlewares/authMiddleware";
import { requireRole } from "../../../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/", requireRole("Admin", "Editor", "Moderator"), advertiserController.getAll);
router.get("/list", requireRole("Admin", "Editor"), advertiserController.list);
router.get("/:id", requireRole("Admin", "Editor", "Moderator"), advertiserController.getById);
router.post("/", requireRole("Admin"), advertiserController.create);
router.put("/:id", requireRole("Admin"), advertiserController.update);
router.delete("/:id", requireRole("Admin"), advertiserController.delete);

export default router;
