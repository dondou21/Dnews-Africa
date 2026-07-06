import { Router } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";

const router = Router();

router.use("/health", healthRouter);
router.use("/categories", categoriesRouter);

export default router;
