import { Router } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import articlesRouter from "./articles";
import authRouter from "./auth";
import usersRouter from "./users";
import rolesRouter from "./roles";

const router = Router();

router.use("/health", healthRouter);
router.use("/categories", categoriesRouter);
router.use("/articles", articlesRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/roles", rolesRouter);

export default router;
