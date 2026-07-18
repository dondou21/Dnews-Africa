import { Router } from "express";
import { roleController } from "../../../controllers/roleController";
import { authenticate } from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, roleController.getAll);

export default router;
