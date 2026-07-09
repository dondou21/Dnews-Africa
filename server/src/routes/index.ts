import { Router } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import articlesRouter from "./articles";
import authRouter from "./auth";
import usersRouter from "./users";
import rolesRouter from "./roles";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";
import searchRouter from "./search";
import mediaRouter from "./media";
import commentsRouter from "./comments";
import tagsRouter from "./tags";
import dashboardRouter from "./dashboard";

const router = Router();

router.use("/health", healthRouter);
router.use("/categories", categoriesRouter);
router.use("/articles", articlesRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/roles", rolesRouter);
router.use("/contact", contactRouter);
router.use("/newsletter", newsletterRouter);
router.use("/search", searchRouter);
router.use("/media", mediaRouter);
router.use("/comments", commentsRouter);
router.use("/tags", tagsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
