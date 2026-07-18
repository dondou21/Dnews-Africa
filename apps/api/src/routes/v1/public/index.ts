import { Router } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import articlesRouter from "./articles";
import searchRouter from "./search";
import tagsRouter from "./tags";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";
import commentsRouter from "./comments";

const router = Router();

router.use("/health", healthRouter);
router.use("/categories", categoriesRouter);
router.use("/articles", articlesRouter);
router.use("/search", searchRouter);
router.use("/tags", tagsRouter);
router.use("/contact", contactRouter);
router.use("/newsletter", newsletterRouter);
router.use("/comments", commentsRouter);

export default router;
