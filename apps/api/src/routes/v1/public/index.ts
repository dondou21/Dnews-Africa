import { Router, Request, Response, NextFunction } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import articlesRouter from "./articles";
import searchRouter from "./search";
import tagsRouter from "./tags";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";
import commentsRouter from "./comments";
import eventsRouter from "./events";
import sponsorsRouter from "./sponsors";

const router = Router();

function noCache(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

router.use(noCache);
router.use("/health", healthRouter);
router.use("/categories", categoriesRouter);
router.use("/articles", articlesRouter);
router.use("/search", searchRouter);
router.use("/tags", tagsRouter);
router.use("/contact", contactRouter);
router.use("/newsletter", newsletterRouter);
router.use("/comments", commentsRouter);
router.use("/events", eventsRouter);
router.use("/sponsors", sponsorsRouter);

export default router;
