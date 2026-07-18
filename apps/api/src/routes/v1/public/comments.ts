import { Router } from "express";
import { commentController } from "../../../controllers/commentController";

const router = Router();

router.get("/", commentController.getAll);
router.get("/:id", commentController.getById);

export default router;
