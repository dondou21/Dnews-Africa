import { Router } from "express";
import { searchController } from "../controllers/searchController";
import { searchLimiter } from "../middlewares/rateLimit";

const router = Router();

router.get("/", searchLimiter, searchController.search);

export default router;
