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

function publicCache(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET") {
    const isHealth = req.path === "/health" || req.path === "/health/";
    const isEvents = req.path === "/events" || req.path === "/events/";
    if (isHealth) {
      res.setHeader("Cache-Control", "no-store");
    } else if (isEvents) {
      res.setHeader("Cache-Control", "no-cache");
    } else {
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=60");
    }
  }
  next();
}

router.use(publicCache);
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
