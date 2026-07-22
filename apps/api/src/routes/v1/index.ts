import { Router } from "express";
import publicRouter from "./public";
import cmsRouter from "./cms";

const router = Router();

router.use("/", publicRouter);
router.use("/public", publicRouter);
router.use("/cms", cmsRouter);

export default router;
