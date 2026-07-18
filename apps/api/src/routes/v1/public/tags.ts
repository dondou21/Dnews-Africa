import { Router } from "express";
import { tagController } from "../../../controllers/tagController";

const router = Router();

router.get("/", tagController.getAll);
router.get("/:id", tagController.getById);

export default router;
