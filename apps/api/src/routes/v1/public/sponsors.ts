import { Router } from "express";
import { sponsorController } from "../../../controllers/sponsorController";

const router = Router();

router.get("/", sponsorController.getActive);

export default router;
