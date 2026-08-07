import { Router, Request, Response } from "express";
import prisma from "../../../utils/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  let database = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }

  res.status(database === "up" ? 200 : 503).json({
    status: database === "up" ? "ok" : "degraded",
    database,
    timestamp: new Date().toISOString(),
  });
});

export default router;
