import { Router } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import articlesRouter from "./articles";
import authRouter from "./auth";

const router = Router();

router.use("/health", healthRouter);
router.use("/categories", categoriesRouter);
router.use("/articles", articlesRouter);
router.use("/auth", authRouter);

export default router;
